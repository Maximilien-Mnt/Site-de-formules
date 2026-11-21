// Curseur paramétrique réutilisé par les graphes (fonctions et presets).
// Input range natif : navigation clavier native, valeur diffusée par <output>.
import { useId } from 'react'

interface Props {
  /** Texte du label visible (déjà localisé par l'appelant). */
  label: string
  /** Valeur affichée à côté du curseur (déjà formatée par l'appelant). */
  valueText: string
  min: number
  max: number
  step: number
  value: number
  onChange: (next: number) => void
  /** Label ARIA plus explicite que le texte visible (ex. « Paramètre k »). */
  ariaLabel?: string
}

export default function ParamSlider({
  label,
  valueText,
  min,
  max,
  step,
  value,
  onChange,
  ariaLabel,
}: Props) {
  const id = useId()

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
        <output htmlFor={id} className="text-sm tabular-nums text-muted">
          {valueText}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel}
        onInput={(e) => onChange(Number(e.currentTarget.value))}
        className="w-full"
      />
    </div>
  )
}