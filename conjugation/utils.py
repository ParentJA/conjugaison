__author__ = 'jason.a.parent@gmail.com (Jason Parent)'

# Standard library imports...
import abc
import re


PRONOUNS_SINGULAR = ('je', 'tu', 'il')

PRONOUNS_PLURAL = ('nous', 'vous', 'ils')

PRONOUNS = PRONOUNS_SINGULAR + PRONOUNS_PLURAL

IRREGULAR_ER_VERBS_1 = re.compile(r'|'.join((
    r'celer',
    r'ciseler',
    r'd\u00E9manteler',
    r'\u00E9carteler',
    r'geler',
    r'harceler',
    r'marteler',
    r'modeler',
    r'peler',
)))

IRREGULAR_ER_VERBS_2 = re.compile(r'|'.join((
    r'acheter',
    r'corseter',
    r'crocheter',
    r'fileter',
    r'fureter',
    r'haleter',
)))

E_ER_PATTERN = re.compile(r'^(.+)(e|\u00E9)([^aeiou]+)er$')

IRREGULAR_IR_VERBS_1 = re.compile('|'.join([
    r'dormir',
    r'mentir',
    r'partir',
    r'sentir',
    r'servir',
    r'sortir'
]))

IRREGULAR_IR_VERBS_2 = re.compile('|'.join([
    r'couvrir',
    r'cueillir',
    r'd\u00E9couvrir',
    r'offrir',
    r'ouvrir',
    r'souffrir'
]))

IRREGULAR_IR_VERBS_3 = re.compile('|'.join([
    r'asseoir',
    r'courir',
    r'devoir',
    r'falloir',
    r'mourir',
    r'pleuvoir',
    r'pouvoir',
    r'recevoir',
    r'savoir',
    r'tenir',
    r'valoir',
    r'venir',
    r'voir',
    r'vouloir'
]))


class Conjugator(object):
    __metaclass__ = abc.ABCMeta

    @staticmethod
    def create_rules(je='e', tu='es', il='e', nous='ons', vous='ez', ils='ent'):
        return dict(je=je, tu=tu, il=il, nous=nous, vous=vous, ils=ils)

    @abc.abstractmethod
    def conjugate(self, infinitive, radical, pronoun):
        raise NotImplementedError


class ERConjugator(Conjugator):
    def conjugate(self, infinitive, radical, pronoun):
        conjugation = Conjugator.create_rules()

        if infinitive == 'aller':
            radical = ''
            conjugation = Conjugator.create_rules(je='vais', tu='vas', il='va', nous='allons', vous='allez', ils='vont')

        elif radical.endswith('g') and pronoun == 'nous':
            conjugation = Conjugator.create_rules(nous='eons')

        elif radical.endswith('c') and pronoun == 'nous':
            conjugation = Conjugator.create_rules(nous='\u00E7ons')

        # TODO: Handle rule associated with -ier ending...
        elif radical.endswith('i'):
            pass

        # TODO: Handle optional rule associated with -ayer ending...
        elif radical.endswith('ay'):
            pass

        elif radical.endswith('oy') or radical.endswith('uy'):
            radical = radical[:-1]
            conjugation = Conjugator.create_rules(je='ie', tu='ies', il='ie', ils='ient')

        elif radical.endswith('el'):
            conjugation = Conjugator.create_rules(je='le', tu='les', il='le', ils='lent')

            if IRREGULAR_ER_VERBS_1.search(infinitive) is not None:
                # Conjugate like -e_er verbs...
                if pronoun in PRONOUNS_SINGULAR or pronoun == 'ils':
                    re.sub(r'^(.+)e([^aeiou]+)$', r'\1\u00E8\2', radical)

        elif radical.endswith('et'):
            conjugation = Conjugator.create_rules(je='te', tu='tes', il='te', ils='tent')

            if IRREGULAR_ER_VERBS_2.search(infinitive) is not None:
                # Conjugate like -e_er verbs...
                if pronoun in PRONOUNS_SINGULAR or pronoun == 'ils':
                    re.sub(r'^(.+)e([^aeiou]+)$', r'\1\u00E8\2', radical)

        # Words that end with -e_er or -\u00E9_er...
        elif E_ER_PATTERN.search(infinitive) is not None:
            if pronoun in PRONOUNS_SINGULAR or pronoun == 'ils':
                re.sub(r'^(.+)(e|\u00E9)([^aeiou]+)$', r'\1\u00E8\2', radical)

        return radical + conjugation[pronoun]


class IRConjugator(Conjugator):
    def conjugate(self, infinitive, radical, pronoun):
        conjugation = Conjugator.create_rules(je='is', tu='is', il='it', nous='issons', vous='issez', ils='issent')

        if IRREGULAR_IR_VERBS_1.search(infinitive) is not None:
            if pronoun in PRONOUNS_SINGULAR:
                radical = radical[:-1]

            conjugation = Conjugator.create_rules(je='s', tu='s', il='t')

        elif IRREGULAR_IR_VERBS_2.search(infinitive) is not None:
            conjugation = Conjugator.create_rules()

        elif IRREGULAR_IR_VERBS_3.search(infinitive) is not None:
            pass

        return radical + conjugation[pronoun]


class REConjugator(Conjugator):
    def conjugate(self, infinitive, radical, pronoun):
        conjugation = Conjugator.create_rules(je='s', tu='s', il='', nous='ons', vous='ez', ils='ent')

        return radical + conjugation[pronoun]


class ConjugatorFactory(object):
    def conjugator(self, infinitive):
        if infinitive.endswith('er'):
            return ERConjugator()
        elif infinitive.endswith('ir'):
            return IRConjugator()
        elif infinitive.endswith('re'):
            return REConjugator()
        else:
            return None