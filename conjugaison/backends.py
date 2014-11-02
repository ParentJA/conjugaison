__author__ = 'jason.a.parent@gmail.com (Jason Parent)'

# Third-party imports...
from oauth2client.django_orm import Storage

# Django imports...
from django.contrib.auth.models import User

# Local imports...
from conjugation.models import CredentialsModel


class GoogleBackend(object):
    """Creates a user with a Google account."""
    def authenticate(self, email=None, credential=None):
        try:
            user = User.objects.get(email=email)

            storage = Storage(CredentialsModel, 'id', user, 'credential')
            stored_credential = storage.get()

            if credential.id_token == stored_credential.id_token:
                return user
            else:
                return None

        except User.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None