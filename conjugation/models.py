__author__ = "jason.a.parent@gmail.com"

# Third-party imports...
from annoying.fields import JSONField
from oauth2client.django_orm import CredentialsField

# Django imports...
from django.contrib.auth.models import User
from django.db import models

# Local imports...
from .utils import ConjugatorFactory


class CredentialsModel(models.Model):
    id = models.ForeignKey(User, primary_key=True)
    credential = CredentialsField()

    def __unicode__(self):
        return 'Credentials for %s %s' % (self.user.first_name, self.user.last_name)


class UserProgress(models.Model):
    """The progress of a user."""
    user = models.ForeignKey(User)
    progress = JSONField(default=dict(correct={}, incorrect={}))

    def __unicode__(self):
        return 'Progress for %s %s' % (self.user.first_name, self.user.last_name)

    def _infinitives(self, key):
        return self.progress.get(key, {}).setdefault('infinitives', {})

    def _pronouns(self, key):
        return self.progress.get(key, {}).setdefault('pronouns', {})

    def update_progress(self, infinitive, pronoun, correct=True):
        if correct:
            inf = self._infinitives('correct')
            pro = self._pronouns('correct')

        else:
            inf = self._infinitives('incorrect')
            pro = self._pronouns('incorrect')

        inf[infinitive] = inf.setdefault(infinitive, 0) + 1
        pro[pronoun] = pro.setdefault(pronoun, 0) + 1


class Verb(models.Model):
    """A French verb."""
    translation = models.CharField(max_length=250)
    infinitive = models.CharField(max_length=250)
    radical = models.CharField(max_length=250)
    ending = models.CharField(max_length=250)

    class Meta:
        ordering = ('infinitive',)

    def __unicode__(self):
        return self.infinitive

    def conjugation(self, pronoun='je'):
        conjugator = ConjugatorFactory.conjugator(infinitive=self.infinitive)

        if conjugator:
            return conjugator.conjugate(infinitive=self.infinitive, radical=self.radical, pronoun=pronoun)
        else:
            return None