// Taxonomie partagée par le contenu, les filtres et l'UI. Les libellés vivent dans src/i18n/ui/<lang>.json
// (clés : subject.<slug>, domain.<slug>, level.<n>, difficulty.<n>, section.<kind>).

export const SUBJECTS = ['math'] as const; // futur : 'physics', 'chemistry'
export type Subject = (typeof SUBJECTS)[number];

export const ALL_DOMAINS = [
  'arithmetic',
  'algebra',
  'geometry',
  'trigonometry',
  'calculus',
  'probability',
  'statistics',
  'linear-algebra',
  'discrete',
  'number-theory',
] as const;
export type Domain = (typeof ALL_DOMAINS)[number];

export const DOMAINS_BY_SUBJECT: Record<Subject, readonly Domain[]> = {
  math: ALL_DOMAINS,
};

// Niveaux neutres (indépendants d'un pays). Équivalences affichées via i18n (`level.<n>.range`).
// 1 début primaire · 2 fin primaire · 3 collège · 4 lycée (début) · 5 lycée (fin) · 6 université 1-2 · 7 université 3+
export const LEVELS = [1, 2, 3, 4, 5, 6, 7] as const;
export const DIFFICULTIES = [1, 2, 3, 4, 5] as const;

export const SECTION_KINDS = [
  'intuition',
  'explanation',
  'proof',
  'history',
  'methods',
  'applications',
  'mistakes',
  'further',
] as const;
export type SectionKind = (typeof SECTION_KINDS)[number];

export const GRAPH_PRESETS = ['right-triangle', 'unit-circle'] as const;
