// Bandeau d'erreur du graphe : expression invalide ou échec de chargement de mathjs.
import type { Lang } from '@/i18n/config'
import { t } from '@/i18n/index'

export default function GraphError({ lang }: { lang: Lang }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 border-l-3 border-danger bg-danger-soft p-4"
    >
      <svg
        className="mt-0.5 h-5 w-5 shrink-0 text-danger"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p className="text-sm text-danger">{t(lang, 'graph.error')}</p>
    </div>
  )
}