import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { CharacterSchema, CharacterProfileSchema } from '@/lib/schemas/character';


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
    providerOptions: {
      openai: {
        reasoningEffort: 'low'
      }
    }
  });

  console.log(response.object);

  console.log('[character API] received name:', name);

  return NextResponse.json(response.object);
}


