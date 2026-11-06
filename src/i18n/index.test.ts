import { describe, it, expect } from 'vitest';
import { t, getLangFromUrl, localizedPath, SUPPORTED_LANGS, type TranslationKey } from '@/i18n/index';

describe('t()', () => {
  it('traduit une clé simple', () => {
    expect(t('fr', 'nav.formulas')).toBe('Formules');
    expect(t('fr', 'site.name')).toBe('Formulo');
  });

  it('interpole les variables {var}', () => {
    expect(t('fr', 'level.label', { level: 3 })).toBe('Niveau 3');
    expect(t('fr', 'exercise.minutes', { count: 10 })).toBe('10 min');
  });

  it('sélectionne le pluriel via Intl.PluralRules sur clé de base', () => {
    expect(t('fr', 'common.results' as TranslationKey, { count: 1 })).toBe('1 résultat');
    expect(t('fr', 'common.results' as TranslationKey, { count: 5 })).toBe('5 résultats');
    expect(t('fr', 'review.dueCount' as TranslationKey, { count: 1 })).toBe('1 fiche à réviser');
    expect(t('fr', 'review.dueCount' as TranslationKey, { count: 3 })).toBe('3 fiches à réviser');
  });

  it('sélectionne le pluriel avec la clé suffixée .one/.other', () => {
    expect(t('fr', 'common.results.one', { count: 1 })).toBe('1 résultat');
    expect(t('fr', 'common.results.other', { count: 5 })).toBe('5 résultats');
  });

  it('laisse le placeholder intact si la variable est absente', () => {
    expect(t('fr', 'catalog.empty.title')).toBe('Aucune formule ne correspond');
    expect(t('fr', 'level.label', {})).toBe('Niveau {level}');
  });

  it('revient sur fr pour une langue inconnue', () => {
    expect(t('xx' as any, 'nav.formulas')).toBe('Formules');
    expect(t('en' as any, 'site.name')).toBe('Formulo');
  });

  it('retourne la clé si elle est introuvable', () => {
    expect(t('fr', 'clef.inexistante' as any)).toBe('clef.inexistante');
  });

  it('supporte toutes les langues déclarées', () => {
    for (const lang of SUPPORTED_LANGS) {
      expect(t(lang, 'nav.formulas')).toBe('Formules');
    }
  });
});

describe('getLangFromUrl()', () => {
  it('extrait la langue depuis une URL préfixée', () => {
    expect(getLangFromUrl('/fr/formules/')).toBe('fr');
    expect(getLangFromUrl('/fr/')).toBe('fr');
    expect(getLangFromUrl('/fr/exercices/')).toBe('fr');
  });

  it('retourne undefined sans préfixe de langue', () => {
    expect(getLangFromUrl('/formules/')).toBeUndefined();
    expect(getLangFromUrl('/')).toBeUndefined();
    expect(getLangFromUrl('')).toBeUndefined();
  });

  it('retourne undefined pour une langue non supportée', () => {
    expect(getLangFromUrl('/en/formules/')).toBeUndefined();
    expect(getLangFromUrl('/de/')).toBeUndefined();
  });
});

describe('localizedPath()', () => {
  it('construit un chemin avec préfixe de langue', () => {
    expect(localizedPath('fr', 'formulas')).toBe('/fr/formules/');
    expect(localizedPath('fr', 'exercises')).toBe('/fr/exercices/');
    expect(localizedPath('fr', 'review')).toBe('/fr/reviser/');
    expect(localizedPath('fr', 'progress')).toBe('/fr/progression/');
    expect(localizedPath('fr', 'about')).toBe('/fr/a-propos/');
  });

  it('remplace le paramètre :id', () => {
    expect(localizedPath('fr', 'formula', { id: 'pythagore' })).toBe(
      '/fr/formules/pythagore/',
    );
    expect(localizedPath('fr', 'exercise', { id: 'aire-disque-01' })).toBe(
      '/fr/exercices/aire-disque-01/',
    );
  });

  it('lève une erreur si un paramètre est manquant', () => {
    expect(() => localizedPath('fr', 'formula', {})).toThrow();
  });
});