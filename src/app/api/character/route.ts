import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';

const CharacterSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(100, 'name is too long'),
});

const CharacterProfileSchema = z.object({
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
  })
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = CharacterSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: 'Validation error', details: result.error.flatten() },
      { status: 400 },
    );
  }

  const { name } = result.data;

  const systemPrompt = `
# 目的
与えられたキャラクター名から推論してキャラクター情報を正規化し、下記のスキーマのJSONを出力してください。

# 方針
- 出力言語は日本語（"meta.language":"ja"）とします
- キーの順序はスキーマ順を維持。未定義のキーは追加しません。重複キーは禁止。

# スキーマ
{
  "type": "object",
  "required": [
    "meta","identity","description","appearance","personality","background",
    "capabilities","relationships","story","voice","setting"
  ],
  "properties": {
    "meta": {
      "type": "object",
      "required": ["id","version","language","tags","created_by","updated_at","license"],
      "properties": {
        "id": {"type": "string"},
        "version": {"type": "string", "default": "1.0"},
        "language": {"type": "string", "enum": ["ja","en","zh","ko","fr","de","es","it","pt","ru"]},
        "tags": {"type": "array", "items": {"type": "string"}},
        "created_by": {"type": "string"},
        "updated_at": {
          "type": "string",
          "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\\.[0-9]{1,3})?[+-][0-9]{2}:[0-9]{2}$"
        },
        "license": {"type": "string"}
      }
    },
    "identity": {
      "type": "object",
      "required": ["name","aliases","pronouns","age","species_or_race","role_or_occupation","archetype"],
      "properties": {
        "name": {"type": "string"},
        "aliases": {"type": "array", "items": {"type": "string"}},
        "pronouns": {"type": "string"},
        "age": {"type": "string"},
        "species_or_race": {"type": "string"},
        "role_or_occupation": {"type": "string"},
        "archetype": {"type": "string"}
      }
    },
    "description": {"type": "string"},
    "appearance": {
      "type": "object",
      "required": ["height","build","distinct_features","clothing_style","color_palette"],
      "properties": {
        "height": {"type": "string"},
        "build": {"type": "string"},
        "distinct_features": {"type": "array", "items": {"type": "string"}},
        "clothing_style": {"type": "string"},
        "color_palette": {"type": "array", "items": {"type": "string"}}
      }
    },
    "personality": {
      "type": "object",
      "required": ["summary","traits_positive","traits_negative","values","quirks","motivations","fears","temperament"],
      "properties": {
        "summary": {"type": "string"},
        "traits_positive": {"type": "array", "items": {"type": "string"}},
        "traits_negative": {"type": "array", "items": {"type": "string"}},
        "values": {"type": "array", "items": {"type": "string"}},
        "quirks": {"type": "array", "items": {"type": "string"}},
        "motivations": {"type": "array", "items": {"type": "string"}},
        "fears": {"type": "array", "items": {"type": "string"}},
        "temperament": {"type": "string"}
      }
    },
    "background": {
      "type": "object",
      "required": ["birthplace","family","education","culture","formative_events"],
      "properties": {
        "birthplace": {"type": "string"},
        "family": {"type": "array", "items": {"type": "string"}},
        "education": {"type": "string"},
        "culture": {"type": "string"},
        "formative_events": {"type": "array", "items": {"type": "string"}}
      }
    },
    "capabilities": {
      "type": "object",
      "required": ["skills","powers_or_magic","equipment","weaknesses","constraints_or_costs"],
      "properties": {
        "skills": {"type": "array", "items": {"type": "string"}},
        "powers_or_magic": {"type": "array", "items": {"type": "string"}},
        "equipment": {"type": "array", "items": {"type": "string"}},
        "weaknesses": {"type": "array", "items": {"type": "string"}},
        "constraints_or_costs": {"type": "array", "items": {"type": "string"}}
      }
    },
    "relationships": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name_or_id","type","status","history","metrics"],
        "properties": {
          "name_or_id": {"type": "string"},
          "type": {"type": "string"},
          "status": {"type": "string"},
          "history": {"type": "string"},
          "metrics": {
            "type": "object",
            "required": ["trust","affection","tension"],
            "properties": {
              "trust": {"type": "number", "minimum": 0, "maximum": 1},
              "affection": {"type": "number", "minimum": 0, "maximum": 1},
              "tension": {"type": "number", "minimum": 0, "maximum": 1}
            }
          }
        }
      }
    },
    "story": {
      "type": "object",
      "required": ["goals","stakes","obstacles","arc","timeline"],
      "properties": {
        "goals": {
          "type": "object",
          "required": ["short_term","long_term"],
          "properties": {
            "short_term": {"type": "array", "items": {"type": "string"}},
            "long_term": {"type": "array", "items": {"type": "string"}}
          }
        },
        "stakes": {"type": "string"},
        "obstacles": {"type": "array", "items": {"type": "string"}},
        "arc": {
          "type": "object",
          "required": ["setup","flaws_exposed","turning_points","growth","resolution"],
          "properties": {
            "setup": {"type": "string"},
            "flaws_exposed": {"type": "string"},
            "turning_points": {"type": "array", "items": {"type": "string"}},
            "growth": {"type": "string"},
            "resolution": {"type": "string"}
          }
        },
        "timeline": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["date","age","title","summary","impact"],
            "properties": {
              "date": {"type": "string", "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"},
              "age": {"type": "string"},
              "title": {"type": "string"},
              "summary": {"type": "string"},
              "impact": {"type": "string"}
            }
          }
        }
      }
    },
    "voice": {
      "type": "object",
      "required": ["diction","tone","catchphrases","dialogue_examples"],
      "properties": {
        "diction": {"type": "string"},
        "tone": {"type": "string"},
        "catchphrases": {"type": "array", "items": {"type": "string"}},
        "dialogue_examples": {"type": "array", "items": {"type": "string"}}
      }
    },
    "setting": {
      "type": "object",
      "required": ["world","era","locations","tech_level_or_magic_rules"],
      "properties": {
        "world": {"type": "string"},
        "era": {"type": "string"},
        "locations": {"type": "array", "items": {"type": "string"}},
        "tech_level_or_magic_rules": {"type": "string"}
      }
    }
  }
}
  `

  const response = await generateObject({
    model: openai('gpt-5'),
    system: systemPrompt,
    prompt: name,
    schema: CharacterProfileSchema,
    reasoning: { effort: 'low' }
  });

  console.log(response.object);

  console.log('[character API] received name:', name);

  return NextResponse.json({ ok: true, name });
}


