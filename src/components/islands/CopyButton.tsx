import { useState } from "react";
import { t } from "@/i18n/index";
import type { Lang } from "@/i18n/config";

interface Props {
  latex: string;
  lang: Lang;
}

export default function CopyButton({ latex, lang }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(latex);
      (
        window as Window & { posthog?: { capture: (event: string) => void } }
      ).posthog?.capture("formula_latex_copied");
      (
        window as Window & {
          posthog?: { logger?: { info: (message: string) => void } };
        }
      ).posthog?.logger?.info("formula latex copied");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // presse-papiers indisponible : l'appli reste utilisable
    }
  };

  return (
    <button
      onClick={copy}
      aria-label={t(lang, "formula.copyLatex")}
      title={t(lang, "formula.copyLatex")}
      className="rounded-md p-1.5 text-text hover:bg-surface-2 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-[2px]"
    >
      {copied ? (
        <svg
          className="w-4 h-4 text-success"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
          />
        </svg>
      )}
      <span className="sr-only">
        {copied ? t(lang, "common.copied") : t(lang, "formula.copyLatex")}
      </span>
    </button>
  );
}
