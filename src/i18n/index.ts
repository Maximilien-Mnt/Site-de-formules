import { DEFAULT_LANG, Lang, SUPPORTED_LANGS, localizedPath, getLangFromUrl } from './config';
import frMessages from './ui/fr.json';

// Toutes les clés feuilles de fr.json (ex. 'nav.formulas', 'common.results.one', 'common.results.other').
type LeafPaths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? LeafPaths<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

export type TranslationKey = LeafPaths<typeof frMessages>;

interface Messages {
  [lang: string]: Record<string, unknown>;
}

const messages: Messages = { fr: frMessages as Record<string, unknown> };

/**
 * Traduction typée avec interpolation {var}, pluriels (.one/.other via Intl.PluralRules)
 * et repli sur fr si la clé est absente dans la langue demandée.
 *
 * Les clés de base porteuses de pluriel (ex. 'common.results') sont acceptées à l'exécution
 * : t() sélectionne .one ou .other via Intl.PluralRules d'après vars.count.
 */
export function t(
  lang: Lang,
  key: TranslationKey,
  vars: Record<string, string | number> = {},
): string {
  const resolvedLang = messages[lang] ? lang : DEFAULT_LANG;
  const msg = messages[resolvedLang] as Record<string, unknown>;

  const resolveTemplate = (k: string, m: Record<string, unknown>): string | undefined => {
    const oneVal = m[`${k}.one`];
    const otherVal = m[`${k}.other`];
    if (typeof oneVal === 'string' && typeof otherVal === 'string') {
      const count = vars.count !== undefined ? Number(vars.count) : 0;
      const rule = new Intl.PluralRules(resolvedLang).select(count);
      return m[`${k}.${rule}`] as string;
    }
    return m[k] as string | undefined;
  };

  let template = resolveTemplate(key, msg);

  // Repli sur fr si la clé est absente dans la langue demandée
  if (!template && resolvedLang !== DEFAULT_LANG) {
    template = resolveTemplate(key, messages[DEFAULT_LANG]);
  }

  if (!template) return String(key);

  // Interpolation {var} ; placeholder laissé intact si variable absente
  return String(template).replace(/\{([^}]+)\}/g, (_match, name) => {
    if (name in vars) return String(vars[name]);
    return `{${name}}`;
  });
}

export { DEFAULT_LANG, SUPPORTED_LANGS, localizedPath, getLangFromUrl };
export type { Lang };