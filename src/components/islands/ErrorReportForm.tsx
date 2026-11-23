import { useState, useCallback } from 'react';
import { t, type TranslationKey } from '@/i18n/index';
import type { Lang } from '@/i18n/config';
import {
  buildErrorReport,
  canSendReport,
  recordSendAttempt,
  type ErrorSeverity,
  type ErrorType,
} from '@/lib/error-report';
import { errorsStore, addErrorReport, exportErrorsJson } from '@/lib/error-store';

interface Props {
  lang: Lang;
  sourceId?: string;
}

const TYPE_OPTIONS: { value: ErrorType; labelKey: TranslationKey }[] = [
  { value: 'formula', labelKey: 'error-report.type.formula' },
  { value: 'exercise', labelKey: 'error-report.type.exercise' },
  { value: 'content', labelKey: 'error-report.type.content' },
  { value: 'technical', labelKey: 'error-report.type.technical' },
  { value: 'other', labelKey: 'error-report.type.other' },
];

const SEVERITY_OPTIONS: { value: ErrorSeverity; labelKey: TranslationKey }[] = [
  { value: 'low', labelKey: 'error-report.severity.low' },
  { value: 'medium', labelKey: 'error-report.severity.medium' },
  { value: 'high', labelKey: 'error-report.severity.high' },
  { value: 'critical', labelKey: 'error-report.severity.critical' },
];

const MAX_DESCRIPTION = 2000;
const MAX_TITLE = 200;

export default function ErrorReportForm({ lang, sourceId }: Props) {
  const [type, setType] = useState<ErrorType>('other');
  const [severity, setSeverity] = useState<ErrorSeverity>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sourcePage = typeof window !== 'undefined' ? window.location.pathname : '';
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);

      if (!canSendReport()) {
        setSubmitError(t(lang, 'error-report.message.rate-limit'));
        return;
      }

      const report = buildErrorReport(
        {
          type,
          severity,
          title: title || undefined,
          description,
          context: {
            sourcePage,
            sourceId: sourceId ?? undefined,
            lang,
            url,
          },
        },
        userAgent
      );

      if (!report) {
        setSubmitError(t(lang, 'error-report.message.error'));
        return;
      }

      setStatus('submitting');
      recordSendAttempt();
      addErrorReport(report);
      setStatus('success');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, severity, title, description, sourcePage, sourceId, lang, url, userAgent]
  );

  // Écran de confirmation + export JSON
  if (status === 'success') {
    const reports = errorsStore.get().reports;
    return (
      <div className="text-center py-6 space-y-3">
        <svg
          className="mx-auto h-10 w-10 text-success"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="font-serif text-lg font-semibold text-text">
          {t(lang, 'error-report.message.success')}
        </h3>
        <p className="text-sm text-muted">
          {t(
            lang,
            'error-report.message.success-detail' as unknown as TranslationKey,
            { count: reports.length }
          )}
        </p>
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 text-xs text-primary hover:text-primary-hover underline underline-offset-4"
          onClick={() => {
            const json = exportErrorsJson();
            const blob = new Blob([json], { type: 'application/json' });
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `formulo-signalements-${new Date()
              .toISOString()
              .slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
          }}
        >
          {t(lang, 'error-report.button.export')}
        </button>
        <button
          type="button"
          className="mt-2 text-xs text-muted hover:text-primary transition-colors"
          onClick={() => {
            const dialog = document.getElementById('error-report-dialog');
            (dialog as HTMLDialogElement)?.close();
          }}
        >
          {t(lang, 'common.close')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <p className="text-sm text-muted">
        {t(lang, 'error-report.description')}
      </p>

      <div className="space-y-2">
        <label htmlFor="report-type" className="block text-xs font-medium text-text">
          {t(lang, 'error-report.label.type')}
        </label>
        <select
          id="report-type"
          value={type}
          onChange={(e) => setType(e.target.value as ErrorType)}
          className="w-full px-3 py-2 text-sm text-text bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          aria-required="true"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {t(lang, o.labelKey)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="report-severity" className="block text-xs font-medium text-text">
          {t(lang, 'error-report.label.severity')}
        </label>
        <select
          id="report-severity"
          value={severity}
          onChange={(e) => setSeverity(e.target.value as ErrorSeverity)}
          className="w-full px-3 py-2 text-sm text-text bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          aria-required="true"
        >
          {SEVERITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {t(lang, o.labelKey)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="report-title" className="block text-xs font-medium text-text">
          {t(lang, 'error-report.label.title')}
        </label>
        <input
          id="report-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_TITLE}
          placeholder={t(lang, 'error-report.placeholder.title')}
          className="w-full px-3 py-2 text-sm text-text bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <p className="text-xs text-subtle">
          {t(lang, 'error-report.hint.title')}
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="report-description" className="block text-xs font-medium text-text">
          {t(lang, 'error-report.label.description')}
        </label>
        <textarea
          id="report-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={MAX_DESCRIPTION}
          rows={5}
          placeholder={t(lang, 'error-report.placeholder.description')}
          className="w-full px-3 py-2 text-sm text-text bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          aria-required="true"
        />
        <p className="text-xs text-subtle">
          {description.length}/{MAX_DESCRIPTION}{' '}
          {t(lang, 'error-report.hint.description-length')}
        </p>
      </div>

      {/* Honeypot : invisible pour les humains, doit rester vide pour les bots. */}
      <div className="hidden" style={{ display: 'none' }}>
        <label htmlFor="report-website">
          {t(lang, 'error-report.aria.honeypot')}
        </label>
        <input
          id="report-website"
          name="website"
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
      </div>

      {submitError && (
        <div
          className="rounded-md border border-danger bg-danger-soft p-3 text-xs text-danger"
          role="alert"
        >
          {submitError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted bg-transparent border border-border rounded-md hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-[2px]"
          onClick={() => {
            const dialog = document.getElementById('error-report-dialog');
            (dialog as HTMLDialogElement)?.close();
          }}
        >
          {t(lang, 'common.cancel')}
        </button>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-on-primary bg-primary rounded-md hover:bg-primary hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px]"
        >
          {status === 'submitting'
            ? t(lang, 'error-report.button.sending')
            : t(lang, 'error-report.button.submit')}
        </button>
      </div>
    </form>
  );
}

