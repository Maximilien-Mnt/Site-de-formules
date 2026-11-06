// Configuration i18n — source unique des langues, directions et segments de route.
// Ajouter une langue = ajouter ici + fichier src/i18n/ui/<lang>.json ; aucun autre code à modifier.
export const SUPPORTED_LANGS = ['fr'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: Lang = 'fr';

export interface LangInfo {
  dir: 'ltr' | 'rtl';
  nativeName: string;
}

export const LANGS: Record<Lang, LangInfo> = {
  fr: { dir: 'ltr', nativeName: 'Français' },
};

// Segments de route localisés par langue.
// Les identifiants de formule/exercice sont communs à toutes les langues (pas de locale dans l'id).
export const ROUTE_SEGMENTS = {
  fr: {
    formulas: 'formules',
    formula: 'formules/:id',
    exercises: 'exercices',
    exercise: 'exercices/:id',
    review: 'reviser',
    progress: 'progression',
    about: 'a-propos',
    legal: 'mentions-legales',
    privacy: 'confidentialite',
  },
} as const;

export type RouteKey = keyof (typeof ROUTE_SEGMENTS)['fr'];

export function localizedPath(lang: Lang, routeKey: RouteKey, params?: Record<string, string | number>): string {
  let path: string = ROUTE_SEGMENTS[lang][routeKey];

  if (params) {
    path = path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_match, paramName) => {
      const value = params[paramName];
      if (value === undefined || value === null) {
        throw new Error(`Paramètre manquant '${paramName}' pour la route '${routeKey}'`);
      }
      return String(value);
    });
  }

  return `/${lang}/${path}/`;
}

export function getLangFromUrl(pathname: string): Lang | undefined {
  const match = pathname.match(/^\/([a-z]{2})(?:\/|$)/);
  if (match && SUPPORTED_LANGS.includes(match[1] as Lang)) {
    return match[1] as Lang;
  }
  return undefined;
}