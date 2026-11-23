import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateErrorReport,
  buildErrorReport,
  escapeHtml,
  stripHtml,
  truncate,
  canSendReport,
  recordSendAttempt,
  type ErrorType,
  type ErrorSeverity,
} from './error-report';

// --- Mock localStorage (environnement node de Vitest) ------------------------

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

beforeEach(() => {
  (globalThis as any).localStorage = localStorageMock;
  localStorageMock.clear();
  vi.restoreAllMocks();
});

// --- escapeHtml -------------------------------------------------------------

describe('escapeHtml', () => {
  it('échappe les caractères HTML dangereux (protection XSS)', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
    expect(escapeHtml('"test" & <x>')).toBe('&quot;test&quot; &amp; &lt;x&gt;');
  });
});

// --- stripHtml --------------------------------------------------------------

describe('stripHtml', () => {
  it('supprime toutes les balises HTML', () => {
    expect(stripHtml('<b>texte</b> <i>enrichi</i>')).toBe('texte enrichi');
  });
  it('normalise les espaces blancs', () => {
    expect(stripHtml('a   b\nc')).toBe('a b c');
  });
  it('renvoie une chaîne vide pour une entrée uniquement balises', () => {
    expect(stripHtml('<div></div>')).toBe('');
  });
});

// --- truncate ---------------------------------------------------------------

describe('truncate', () => {
  it('ne tronque pas si sous la limite', () => {
    expect(truncate('court', 10)).toBe('court');
  });
  it('tronque à la limite demandée', () => {
    expect(truncate('ceci est un texte long', 10)).toHaveLength(10);
  });
});

// --- validateErrorReport ----------------------------------------------------

describe('validateErrorReport', () => {
  const base = {
    type: 'formula' as ErrorType,
    severity: 'medium' as ErrorSeverity,
    description: 'La formule de Pythagore est incorrecte.',
    context: {
      sourcePage: '/fr/formules/pythagore/',
      lang: 'fr',
      url: 'https://example.com/fr/formules/pythagore/',
    },
  };

  it('accepte un rapport valide', () => {
    const r = validateErrorReport(base);
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });

  it('rejette un type invalide', () => {
    const r = validateErrorReport({ ...base, type: 'invalide' as any });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.field === 'type')).toBe(true);
  });

  it('rejette une gravité invalide', () => {
    const r = validateErrorReport({ ...base, severity: 'invalide' as any });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.field === 'severity')).toBe(true);
  });

  it('rejette une description vide', () => {
    const r = validateErrorReport({ ...base, description: '' });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.field === 'description')).toBe(true);
  });

  it('rejette si le honeypot est rempli (détection bot)', () => {
    const r = validateErrorReport({ ...base, honeypot: 'http://spam.com' });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.field === 'honeypot')).toBe(true);
  });

  it('rejette une description trop longue', () => {
    const r = validateErrorReport({ ...base, description: 'x'.repeat(2001) });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.field === 'description')).toBe(true);
  });

  it('rejette un titre trop long', () => {
    const r = validateErrorReport({ ...base, title: 'x'.repeat(201) });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.field === 'title')).toBe(true);
  });

  it('rejette si la page source est manquante', () => {
    const r = validateErrorReport({
      ...base,
      context: { ...base.context, sourcePage: undefined },
    });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.field === 'sourcePage')).toBe(true);
  });
});


// --- buildErrorReport -------------------------------------------------------

describe('buildErrorReport', () => {
  const validInput = {
    type: 'exercise' as ErrorType,
    severity: 'high' as ErrorSeverity,
    title: 'Mon titre',
    description: 'Une description valide.',
    context: {
      sourcePage: '/fr/formules/pythagore/',
      sourceId: 'pythagore',
      lang: 'fr',
      url: 'https://example.com/fr/formules/pythagore/',
    },
  };

  it('construit un rapport complet à partir de saisies valides', () => {
    const report = buildErrorReport(validInput, 'Mozilla/5.0 test');
    expect(report).not.toBeNull();
    expect(report!.id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
    expect(report!.timestamp).toBeGreaterThan(0);
    expect(report!.description).toBe('Une description valide.');
    expect(report!.userAgent).toBe('Mozilla/5.0 test');
    expect(report!.context.sourceId).toBe('pythagore');
    expect(report!.context.lang).toBe('fr');
  });

  it('assainit la description (supprime le HTML)', () => {
    const report = buildErrorReport(
      { ...validInput, description: '<b>oui</b> <script>bad</script>' },
      'UA'
    );
    expect(report!.description).toBe('oui bad');
  });

  it('retourne null si la saisie est invalide', () => {
    const report = buildErrorReport(
      {
        ...validInput,
        description: '',
        context: { ...validInput.context, sourcePage: '' },
      },
      'UA'
    );
    expect(report).toBeNull();
  });
});


// --- rate-limit -------------------------------------------------------------

describe('rate limit côté client', () => {
  it('autorise l\'envoi au début', () => {
    expect(canSendReport()).toBe(true);
  });

  it('bloque après le nombre maximal d\'envois sur une heure', () => {
    const fixedNow = 1_700_000_000_000;
    vi.spyOn(Date, 'now').mockReturnValue(fixedNow);
    for (let i = 0; i < 5; i++) recordSendAttempt();
    expect(canSendReport()).toBe(false);
  });

  it('autorise à nouveau après expiration de la fenêtre journalière', () => {
    const fixedNow = 1_700_000_000_000;
    vi.spyOn(Date, 'now').mockReturnValue(fixedNow);
    for (let i = 0; i < 20; i++) recordSendAttempt();
    expect(canSendReport()).toBe(false);
    // Simule le passage d'un jour (24h)
    vi.spyOn(Date, 'now').mockReturnValue(fixedNow + 24 * 60 * 60 * 1000 + 1000);
    expect(canSendReport()).toBe(true);
  });
});

