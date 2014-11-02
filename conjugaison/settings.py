"""
Django settings for conjugaison project.

For more information on this file, see
https://docs.djangoproject.com/en/1.7/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.7/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.7/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'u=iuhud=!_tir+gw=1+*r58z5a8892-@t4py%6y#7dx)-fq(d^'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = []


# Application definition

DEFAULT_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
)

THIRD_PARTY_APPS = (
    'django_nose',
    'annoying',
)

LOCAL_APPS = (
    'conjugaison',
    'conjugation',
)

INSTALLED_APPS = DEFAULT_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'conjugaison.urls'

WSGI_APPLICATION = 'conjugaison.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases

DATABASES = {
    'default': {}
}

# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.7/howto/static-files/

STATIC_URL = '/static/'


from django.contrib.messages import constants as message_constants

# Changing message tags to conform with Bootstrap 'alert' component class names...
MESSAGE_TAGS = {
    message_constants.DEBUG: 'debug',
    message_constants.INFO: 'info',
    message_constants.SUCCESS: 'success',
    message_constants.WARNING: 'warning',
    message_constants.ERROR: 'danger'
}

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'conjugaison.backends.GoogleBackend',
)

GOOGLE_CLIENT_ID = '381585654432-ga3ape4rvuibcr68ok4c1breif77cim9.apps.googleusercontent.com'
GOOGLE_CLIENT_SECRET = '5vxxgnUHkKnmTOp7j8Y81lfq'
GOOGLE_REDIRECT_URI = 'http://conjugate-me.herokuapp.com/oauth'

GOOGLE_API_KEY = 'AIzaSyAyh8_P92dA1FwVNrX1A7j6s72BmwFoUwQ'

GOOGLE_SCOPE = {
    'email': 'email',
    'login': 'https://www.googleapis.com/auth/plus.login'
}

GOOGLE_API_PEOPLE = 'https://www.googleapis.com/plus/v1/people/me'


try:
    from local_settings import *
except ImportError:
    pass