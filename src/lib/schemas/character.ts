import { z } from 'zod';

export const CharacterSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(100, 'name is too long'),
});

export const CharacterProfileSchema = z.object({
  meta: z.object({
    id: z.string(),
    version: z.string(),
    language: z.enum(['ja', 'en', 'zh', 'ko', 'fr', 'de', 'es', 'it', 'pt', 'ru']),
    tags: z.array(z.string()),
    created_by: z.string(),
    updated_at: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?[+-]\d{2}:\d{2}$/),
    license: z.string(),
  }),
  identity: z.object({
    name: z.string(),
    aliases: z.array(z.string()),
    pronouns: z.string(),
    age: z.string(),
    species_or_race: z.string(),
    role_or_occupation: z.string(),
    archetype: z.string(),
  }),
  description: z.string(),
  appearance: z.object({
    height: z.string(),
    build: z.string(),
    distinct_features: z.array(z.string()),
    clothing_style: z.string(),
    color_palette: z.array(z.string()),
  }),
  personality: z.object({
    summary: z.string(),
    traits_positive: z.array(z.string()),
    traits_negative: z.array(z.string()),
    values: z.array(z.string()),
    quirks: z.array(z.string()),
    motivations: z.array(z.string()),
    fears: z.array(z.string()),
    temperament: z.string(),
  }),
  background: z.object({
    birthplace: z.string(),
    family: z.array(z.string()),
    education: z.string(),
    culture: z.string(),
    formative_events: z.array(z.string()),
  }),
  capabilities: z.object({
    skills: z.array(z.string()),
    powers_or_magic: z.array(z.string()),
    equipment: z.array(z.string()),
    weaknesses: z.array(z.string()),
    constraints_or_costs: z.array(z.string()),
  }),
  relationships: z.array(
    z.object({
      name_or_id: z.string(),
      type: z.string(),
      status: z.string(),
      history: z.string(),
      metrics: z.object({
        trust: z.number().min(0).max(1),
        affection: z.number().min(0).max(1),
        tension: z.number().min(0).max(1),
      }),
    }),
  ),
  story: z.object({
    goals: z.object({
      short_term: z.array(z.string()),
      long_term: z.array(z.string()),
    }),
    stakes: z.string(),
    obstacles: z.array(z.string()),
    arc: z.object({
      setup: z.string(),
      flaws_exposed: z.string(),
      turning_points: z.array(z.string()),
      growth: z.string(),
      resolution: z.string(),
    }),
    timeline: z.array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        age: z.string(),
        title: z.string(),
        summary: z.string(),
        impact: z.string(),
      }),
    ),
  }),
  voice: z.object({
    diction: z.string(),
    tone: z.string(),
    catchphrases: z.array(z.string()),
    dialogue_examples: z.array(z.string()),
  }),
  setting: z.object({
    world: z.string(),
    era: z.string(),
    locations: z.array(z.string()),
    tech_level_or_magic_rules: z.string(),
  }),
});

export type CharacterNameInput = z.infer<typeof CharacterSchema>;
export type CharacterProfile = z.infer<typeof CharacterProfileSchema>;


