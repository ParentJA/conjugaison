__author__ = 'jason.a.parent@gmail.com (Jason Parent)'

# Standard library imports...
import json
import os
import random

# Third-party imports...
from oauth2client.client import flow_from_clientsecrets
from oauth2client.django_orm import Storage

import requests

# Django imports...
from django.contrib import messages
from django.contrib.auth import authenticate
from django.contrib.auth import login
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.http import HttpResponseBadRequest
from django.shortcuts import redirect
from django.shortcuts import render
from django.views.decorators.http import require_POST

# Local imports...
from .models import CredentialsModel
from .models import UserProgress
from .models import Verb
from .utils import PRONOUNS

import conjugaison.settings as settings


CLIENT_SECRETS = os.path.join(os.path.dirname(__file__), '..', 'client_secrets.json')

FLOW = flow_from_clientsecrets(
    CLIENT_SECRETS,
    scope=' '.join([settings.GOOGLE_SCOPE['email'], settings.GOOGLE_SCOPE['login']]),
    redirect_uri=settings.GOOGLE_REDIRECT_URI
)


def sign_up(request):
    return render(request, 'sign_up.html')


def log_in(request):
    username = request.POST.get('username')
    password = request.POST.get('password')

    if username is None or password is None:
        if request.user.is_authenticated():
            return redirect(reverse('quiz'))

        return render(request, 'log_in.html', {
            'google_client_id': settings.GOOGLE_CLIENT_ID,
            'google_scope_email': settings.GOOGLE_SCOPE['email'],
            'google_scope_login': settings.GOOGLE_SCOPE['login']
        })

    user = authenticate(username=username, password=password)

    if user is None:
        messages.error(request, 'The username and/or password did not match our records.')

    else:
        if user.is_active:
            login(request, user)

            return redirect(reverse('quiz'))

        else:
            messages.error(request, 'Authentication failed. The user ' + username + ' is not active.')

    return render(request, 'log_in.html', {
        'google_client_id': settings.GOOGLE_CLIENT_ID,
        'google_scope_email': settings.GOOGLE_SCOPE['email'],
        'google_scope_login': settings.GOOGLE_SCOPE['login']
    })


def log_in_google(request):
    if request.user.is_authenticated():
        storage = Storage(CredentialsModel, 'id', request.user, 'credential')
        credential = storage.get()

        if credential is not None:
            return redirect(reverse('quiz'))

    # FLOW.params['state'] = 'conjugate'

    authorize_url = FLOW.step1_get_authorize_url()

    return redirect(authorize_url)


def oauth(request):
    credential = FLOW.step2_exchange(request.REQUEST)

    response = requests.get(settings.GOOGLE_API_PEOPLE, params={
        'access_token': credential.access_token
    })

    data = json.loads(response.content)
    email = data['emails'][0].get('value')
    first_name = data['name'].get('givenName')
    last_name = data['name'].get('familyName')

    try:
        google_user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        google_user = User.objects.create_user(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password='conjugate'
        )
    else:
        google_user.save()

    user_progress = UserProgress.objects.create(user=google_user)
    user_progress.save()

    storage = Storage(CredentialsModel, 'id', google_user, 'credential')
    storage.put(credential)

    google_user = authenticate(email=google_user.email, credential=storage.get())

    if google_user is None:
        messages.error(request, 'The google user does not exist.')

    else:
        if google_user.is_active:
            login(request, google_user)

            return redirect(reverse('quiz'))

        else:
            messages.error(request, 'Authentication failed. The Google user ' + email + ' is not active.')

    return redirect(reverse('log_in'))


def quiz(request):
    return render(request, 'quiz.html')


@login_required
def statistics(request):
    try:
        user_progress = UserProgress.objects.get(user=request.user)
    except UserProgress.DoesNotExist:
        return HttpResponseBadRequest('The user does not have progress.')

    return render(request, 'statistics.html', {
        'correct': json.dumps(user_progress.correct),
        'incorrect': json.dumps(user_progress.incorrect)
    })


def verbs(request, quantity=10):
    if quantity < 1:
        quantity = 10

    verbs = Verb.objects.all()

    quiz = {
        'name': '',
        'items': []
    }

    vowels = ('a', 'e', 'i', 'o', 'u', 'y',)

    for i in range(int(quantity)):
        verb = random.choice(verbs)
        pronoun = random.choice(PRONOUNS)

        item = {
            'type': 'constructed_response',
            'instructions': verb.translation,
            'stimulus': verb.infinitive,
            'stem': 'j\'' if pronoun == 'je' and verb.infinitive.startswith(vowels) else pronoun,
            'response': None,
            'correct': False,
            'score': 0,
            'correct_response': [verb.conjugation(pronoun)],
            'options': []
        }

        quiz['items'].append(item)

    return HttpResponse(content=json.dumps(quiz), content_type='application/json')


@login_required
@require_POST
def progress(request):
    post = request.POST

    if 'infinitive' not in post or 'pronoun' not in post or 'correct' not in post:
        return HttpResponseBadRequest(
            'Progress must be reported with an infinitive, a pronoun, and whether the response is correct.'
        )

    infinitive = post.get('infinitive')
    pronoun = post.get('pronoun')
    is_correct = post.get('correct') == 'true'

    try:
        user_progress = UserProgress.objects.get(user=request.user)
    except UserProgress.DoesNotExist:
        return HttpResponseBadRequest('The user does not have progress.')
    else:
        user_progress.update_progress(infinitive, pronoun, correct=is_correct)
        user_progress.save()

    return HttpResponse()


@login_required
def log_out(request):
    logout(request)

    return render(request, 'quiz.html')