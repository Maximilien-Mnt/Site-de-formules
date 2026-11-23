/**
 * Store des signalements d'erreurs — nanostore persistant dans localStorage.
 *
 * Clé versionnée : `formulo:errors:v1`.
 * LocalStorage indisponible ou contenu invalide → repli sur l'état initial.
 */

import { persistentAtom } from '@nanostores/persistent';
import type { WritableAtom } from 'nanostores';
import type { ErrorReport } from './error-report';

export const ERRORS_KEY = 'formulo:errors:v1';

export interface ErrorsState {
  reports: ErrorReport[];
}

export const initialErrorsState: ErrorsState = { reports: [] };

function decodeErrors(raw: string | null): ErrorsState {
  if (!raw) return initialErrorsState;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.reports)) {
      return { reports: parsed.reports };
    }
    return initialErrorsState;
  } catch {
    return initialErrorsState;
  }
}

export const errorsStore: WritableAtom<ErrorsState> = persistentAtom<ErrorsState>(
  ERRORS_KEY,
  initialErrorsState,
  {
    encode: (value) => JSON.stringify(value),
    decode: decodeErrors,
  }
);

/** Ajoute un rapport au store (et au localStorage). Cap à 500 entrées. */
export function addErrorReport(report: ErrorReport): void {
  const s = errorsStore.get();
  errorsStore.set({
    reports: [report, ...s.reports].slice(0, 500),
  });
}

/** Exporte tous les rapports stockés au format JSON (pour envoi manuel à l'admin). */
export function exportErrorsJson(): string {
  return JSON.stringify(errorsStore.get().reports, null, 2);
}

/** Vide tous les rapports stockés. */
export function clearErrors(): void {
  errorsStore.set(initialErrorsState);
}
