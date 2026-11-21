import MiniSearch from "minisearch"
import type { SearchFormula } from "./filters"

// Normalisation de la recherche : insensible à la casse ET aux accents
// (décomposition NFD + suppression des marques diacritiques), ponctuation
// remplacée par des espaces. Appliquée à l'indexation et à la requête.
function stripDiacritics(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export function normalizeText(text: string): string {
  return stripDiacritics(text.toLowerCase())
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// const SEARCH_FIELDS = ["title", "aliases", "keywords", "summary"]
// const SEARCH_BOOST = { title: 2, aliases: 1.5, keywords: 1.2, summary: 1 }

export function createSearchIndex(formulas: readonly SearchFormula[]): MiniSearch<SearchFormula> {
  const index = new MiniSearch<SearchFormula>({
    fields: ["title", "aliases", "keywords", "summary"],
    storeFields: [
      "id",
      "title",
      "summary",
      "keywords",
      "aliases",
      "subject",
      "domain",
      "level",
      "difficulty",
      "topics",
      "latex",
      "originYear",
      "graph",
      "hasProof",
      "hasHistory",
      "hasExercises",
      "url",
    ],
    processTerm: (term) => normalizeText(term),
    searchOptions: {
      prefix: true,
      fuzzy: 0,
    },
  })
  index.addAll(formulas)
  return index
}

export function searchFormulas(index: MiniSearch<SearchFormula>, q: string): SearchFormula[] {
  const normalized = normalizeText(q)
  if (!normalized) return []
  const results = index.search(normalized, {
    prefix: true,
    fuzzy: 0,
  })
  return results as unknown as SearchFormula[]
}
