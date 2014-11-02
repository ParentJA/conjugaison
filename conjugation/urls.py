__author__ = 'jason.a.parent@gmail.com (Jason Parent)'

# Django imports...
from django.conf.urls import patterns
from django.conf.urls import url


urlpatterns = patterns('conjugation.views',
    url(r'^$', 'quiz', name='quiz'),
    url(r'^sign_up/$', 'sign_up', name='sign_up'),
    url(r'^log_in/$', 'log_in', name='log_in'),
    url(r'^log_in_google/$', 'log_in_google', name='log_in_google'),
    url(r'^oauth/$', 'oauth', name='oauth'),
    url(r'^statistics/$', 'statistics', name='statistics'),
    url(r'^log_out/$', 'log_out', name='log_out'),
    url(r'^verbs/(?P<quantity>\d+)/$', 'verbs', name='verbs'),
    url(r'^progress/$', 'progress', name='progress'),
)