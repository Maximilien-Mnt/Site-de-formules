// Schémas des collections de contenu (Astro Content Layer).
// NOTE : adapter les imports à la version d'Astro installée. Si `z` n'est plus exporté par 'astro:content'
// (déprécié dans les versions récentes), utiliser : import { z } from 'astro/zod';
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { ALL_DOMAINS, GRAPH_PRESETS, SUBJECTS } from './data/taxonomy';

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const status = z.enum(['draft', 'published']).default('draft');
const level = z.number().int().min(1).max(7);
const difficulty = z.number().int().min(1).max(5);

const graphParam = z.object({
  name: z.string(),
  min: z.number(),
  max: z.number(),
  step: z.number().default(0.1),
  default: z.number(),
});

const graph = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('function'),
    expressions: z.array(z.string()).min(1), // évaluables par mathjs, variable x + paramètres
    params: z.array(graphParam).default([]),
    viewport: z.object({
      x: z.tuple([z.number(), z.number()]),
      y: z.tuple([z.number(), z.number()]),
    }),
  }),
  z.object({ kind: z.literal('preset'), preset: z.enum(GRAPH_PRESETS) }),
]);

// --- Formules : données partagées (fichier = identifiant) ---
const formulas = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/formulas' }),
  schema: z.object({
    subject: z.enum(SUBJECTS),
    domain: z.enum(ALL_DOMAINS),
    topics: z.array(slug).default([]),
    level,
    difficulty,
    originYear: z.number().int().optional(), // négatif = av. J.-C. ; approximatif (plus ancienne trace connue)
    latex: z.string(),
    variants: z.array(z.object({ id: slug, latex: z.string() })).default([]),
    variables: z.array(z.object({ symbol: z.string(), unit: z.string().optional() })),
    prerequisites: z.array(slug).default([]),
    related: z.array(slug).default([]),
    confusedWith: z.array(slug).default([]),
    graph: graph.optional(),
    status,
  }),
});

// --- Formules : textes localisés (id = "<lang>/<id>") ---
const formulaTexts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/formula-texts' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(220),
    aliases: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    variableNames: z.record(z.string(), z.string()).default({}),
    variantLabels: z.record(z.string(), z.string()).default({}),
  }),
});

// --- Exercices : données partagées ---
const exerciseBase = z.object({
  subject: z.enum(SUBJECTS),
  domain: z.enum(ALL_DOMAINS),
  level,
  difficulty,
  formulas: z.array(slug).min(1),
  estimatedMinutes: z.number().int().min(1).default(3),
  status,
});

const exercises = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/exercises' }),
  schema: z.discriminatedUnion('kind', [
    exerciseBase.extend({
      kind: z.literal('numeric'),
      answer: z.object({
        value: z.number(),
        tolerance: z.number().min(0).default(0),
        unit: z.string().optional(),
      }),
    }),
    exerciseBase.extend({
      kind: z.literal('qcm'),
      choices: z.array(slug).min(2), // identifiants ; libellés dans le texte localisé
      correct: z.array(slug).min(1),
    }),
    exerciseBase.extend({ kind: z.literal('open') }),
  ]),
});

// --- Exercices : textes localisés (champs en Markdown + LaTeX) ---
const exerciseTexts = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/exercise-texts' }),
  schema: z.object({
    title: z.string(),
    statement: z.string(),
    choices: z.record(z.string(), z.string()).optional(),
    hints: z.array(z.string()).default([]),
    solution: z.string(),
  }),
});

export const collections = { formulas, formulaTexts, exercises, exerciseTexts };
