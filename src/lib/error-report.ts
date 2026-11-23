/**
 * Système de signalement d'erreurs — modèle, validation et assainissement.
 *
 * Logique pure, sans DOM, testable avec Vitest.
 *
 * Sécurité :
 *  - Aucun champ d'information personnelle obligatoire (pas d'email/nom/téléphone).
 *  - Le contenu utilisateur est assaini (balises HTML supprimées, échappement).
 *  - Aucun rendu avec innerHTML / dangerouslySetInnerHTML.
 *  - Honeypot pour détecter les bots.
 *  - Rate-limit côté client (heuristique, complément d'un limiteur edge/serveur).
 */

export type ErrorType = 'formula' | 'exercise' | 'content' | 'technical' | 'other';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorReportContext {
  /** Route courante, ex. /fr/formules/pythagore/ */
  sourcePage: string;
  /** ID de formule ou exercice concerné (optionnel) */
  sourceId?: string;
  /** Langue de l'interface */
  lang: string;
  /** URL complète de la page */
  url: string;
}

export interface ErrorReport {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  title?: string; // optionnel, court
  description: string; // requis
  context: ErrorReportContext;
  timestamp: number; // epoch ms
  userAgent: string; // tronqué
  screenResolution?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// --- Limites de sécurité -----------------------------------------------------

const MAX_DESCRIPTION = 2000;
const MAX_TITLE = 200;
const RATE_LIMIT_MAX_PER_HOUR = 5;
const RATE_LIMIT_MAX_PER_DAY = 20;
const RATE_STORAGE_KEY = 'formulo:errors:rate:v1';

// --- Identifiants -----------------------------------------------------------

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// --- Assainissement (XSS) ---------------------------------------------------

/**
 * Échappe le HTML pour éviter toute XSS.
 * Le rendu côté page doit utiliser textContent (jamais innerHTML).
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Supprime toute balise HTML et normalise les espaces blancs.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Tronque une chaîne à `max` caractères.
 */
export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max).trim();
}

// --- Validation --------------------------------------------------------------

const VALID_TYPES: ErrorType[] = [
  'formula',
  'exercise',
  'content',
  'technical',
  'other',
];

const VALID_SEVERITIES: ErrorSeverity[] = ['low', 'medium', 'high', 'critical'];

/**
 * Valide un rapport d'erreur brut avant stockage ou envoi.
 * Retourne un résultat avec la liste des champs invalides.
 */
export function validateErrorReport(input: {
  type?: string;
  severity?: string;
  title?: string;
  description?: string;
  context?: Partial<ErrorReportContext>;
  honeypot?: unknown;
}): ValidationResult {
  const errors: ValidationError[] = [];

  // Honeypot : si un remplit ce champ caché, c'est probablement un bot.
  if (
    input.honeypot !== undefined &&
    input.honeypot !== '' &&
    input.honeypot !== null
  ) {
    errors.push({ field: 'honeypot', message: 'Champ non autorisé.' });
    return { valid: false, errors };
  }

  if (!input.type || !VALID_TYPES.includes(input.type as ErrorType)) {
    errors.push({ field: 'type', message: 'Type d\'erreur invalide.' });
  }

  if (
    !input.severity ||
    !VALID_SEVERITIES.includes(input.severity as ErrorSeverity)
  ) {
    errors.push({ field: 'severity', message: 'Gravité invalide.' });
  }

  if (input.title && String(input.title).length > MAX_TITLE) {
    errors.push({
      field: 'title',
      message: `Titre trop long (${MAX_TITLE} caractères maximum).`,
    });
  }

  const description = stripHtml(String(input.description ?? ''));
  if (!description) {
    errors.push({ field: 'description', message: 'La description est requise.' });
  } else if (description.length > MAX_DESCRIPTION) {
    errors.push({
      field: 'description',
      message: `Description trop longue (${MAX_DESCRIPTION} caractères maximum).`,
    });
  }

  if (!input.context?.sourcePage) {
    errors.push({ field: 'sourcePage', message: 'Page source manquante.' });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Construit un ErrorReport à partir des saisies utilisateur et du contexte.
 * Retourne null si la validation échoue.
 */
export function buildErrorReport(
  input: {
    type: ErrorType;
    severity: ErrorSeverity;
    title?: string;
    description: string;
    context: ErrorReportContext;
  },
  userAgent: string
): ErrorReport | null {
  const validation = validateErrorReport({
    type: input.type,
    severity: input.severity,
    title: input.title,
    description: input.description,
    context: input.context,
  });

  if (!validation.valid) return null;

  return {
    id: generateId(),
    type: input.type,
    severity: input.severity,
    title: input.title ? truncate(String(input.title), MAX_TITLE) : undefined,
    description: stripHtml(String(input.description)),
    context: {
      sourcePage: input.context.sourcePage,
      sourceId: input.context.sourceId ?? undefined,
      lang: input.context.lang,
      url: input.context.url,
    },
    timestamp: Date.now(),
    userAgent: truncate(userAgent, 200),
    screenResolution:
      typeof screen !== 'undefined'
        ? `${screen.width}x${screen.height}`
        : undefined,
  };
}

// --- Rate-limit côté client --------------------------------------------------

/**
 * Vérifie si l'utilisateur peut encore envoyer un rapport (heuristique client).
 * Ce n'est pas une sécurité absolue ; un limiteur edge/serveur est requis en Phase 2.
 */
export function canSendReport(): boolean {
  try {
    const raw = localStorage.getItem(RATE_STORAGE_KEY);
    const now = Date.now();
    const records: number[] = raw ? JSON.parse(raw) : [];

    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * 60 * 60 * 1000;

    const recentHour = records.filter((t) => now - t < oneHour).length;
    const recentDay = records.filter((t) => now - t < oneDay).length;

    if (recentHour >= RATE_LIMIT_MAX_PER_HOUR) return false;
    if (recentDay >= RATE_LIMIT_MAX_PER_DAY) return false;

    return true;
  } catch {
    // Stockage indisponible : on laisse passer en mode dégradé.
    return true;
  }
}

/**
 * Enregistre un horodatage d'envoi pour le rate-limit côté client.
 */
export function recordSendAttempt(): void {
  try {
    const raw = localStorage.getItem(RATE_STORAGE_KEY);
    const now = Date.now();
    const records: number[] = raw ? JSON.parse(raw) : [];
    const oneDay = 24 * 60 * 60 * 1000;
    const filtered = records.filter((t) => now - t < oneDay);
    filtered.push(now);
    localStorage.setItem(RATE_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Stockage indisponible : on ignore.
  }
}


