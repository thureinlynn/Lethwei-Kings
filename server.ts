import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractGeminiErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : 'Failed to reach Gemini API.';
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.error?.message) {
      return `Gemini AI service error (${parsed.error.code ?? 500}): ${parsed.error.message}`;
    }
  } catch {
    // Raw message is plain text
  }
  return raw;
}

async function withGeminiRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : '';
      const isTransient =
        msg.includes('503') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED');
      if (!isTransient || attempt === retries) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
    }
  }
  throw lastErr;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // STEP 3A: Structured AI Fighter Generator (Gemini API + JSON Schema)
  app.post('/api/ai/generate-fighter', async (req, res) => {
    try {
      const themePrompt =
        typeof req.body?.prompt === 'string' && req.body.prompt.trim().length > 0
          ? req.body.prompt.trim()
          : 'A fierce Myanmar Lethwei or Southeast Asian standing striker with a distinctive fighting background';

      const role = req.body?.role === 'opponent' ? 'opponent' : 'player';
      const ai = getGeminiClient();

      const response = await withGeminiRetry(() =>
        ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Generate a complete martial arts fighter profile for the game "Lethwei Kings: Tactical MMA & Striking Federation".
Theme / Inspiration: ${themePrompt}
Role: ${role}

Rules:
- Martial arts combatant skilled in Lethwei, Muay Thai, Boxing, Kickboxing, Karate, Wrestling, BJJ, or MMA.
- Allocate attribute stats (strength, speed=Agility, stamina=Condition, durability=Health) each between 4 and 10, summing to roughly 25-29 total points.
- Choose realistic skinTone hex from: #e2b48f, #c88d61, #a46943, #6e432b, #edd0b6.
- Choose hairColor hex from: #18181b, #3f281d, #b91c1c, #eab308, #71717a.
- Choose shortsColor hex from: #18181b, #b91c1c, #047857, #1d4ed8, #d97706.
- Choose wrapColor hex from: #e7e0d3, #dc2626, #1d4ed8.`,
        config: {
          systemInstruction:
            'You are a Myanmar Lethwei and international MMA matchmaker generating balanced, authentic fighter profiles in strict JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Fighter full name (2-3 words max)' },
              nickname: { type: Type.STRING, description: 'Ring nickname (e.g. Golden Forehead)' },
              gender: { type: Type.STRING, enum: ['Male', 'Female'] },
              age: { type: Type.INTEGER, description: 'Age between 18 and 38' },
              birthplace: { type: Type.STRING, description: 'City and country, e.g. Hpa-An, Myanmar' },
              styleLabel: { type: Type.STRING, description: 'Martial arts / MMA specialty label' },
              background: {
                type: Type.STRING,
                description: 'Concise 1-2 sentence combat background and fighting reputation',
              },
              gymId: { type: Type.STRING, enum: ['thuwunna', 'golden_land', 'tiger_mt'] },
              appearance: {
                type: Type.OBJECT,
                properties: {
                  skinTone: { type: Type.STRING },
                  heightCm: { type: Type.INTEGER },
                  weightKg: { type: Type.INTEGER },
                  build: { type: Type.STRING, enum: ['Lean', 'Athletic', 'Heavy'] },
                  hairstyle: {
                    type: Type.STRING,
                    enum: ['Buzz', 'Topknot', 'Mohawk', 'Undercut', 'LongTied', 'Shaved'],
                  },
                  hairColor: { type: Type.STRING },
                  shortsColor: { type: Type.STRING },
                  wrapColor: { type: Type.STRING },
                },
                required: [
                  'skinTone',
                  'heightCm',
                  'weightKg',
                  'build',
                  'hairstyle',
                  'hairColor',
                  'shortsColor',
                  'wrapColor',
                ],
              },
              stats: {
                type: Type.OBJECT,
                properties: {
                  strength: { type: Type.INTEGER },
                  speed: { type: Type.INTEGER },
                  stamina: { type: Type.INTEGER },
                  durability: { type: Type.INTEGER },
                },
                required: ['strength', 'speed', 'stamina', 'durability'],
              },
            },
            required: [
              'name',
              'nickname',
              'gender',
              'age',
              'birthplace',
              'styleLabel',
              'background',
              'gymId',
              'appearance',
              'stats',
            ],
          },
        },
      }));

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        return res.status(502).json({ error: 'Gemini returned an empty fighter response.' });
      }
      const parsed = JSON.parse(rawText);
      return res.json({ fighter: parsed });
    } catch (err: unknown) {
      const message = extractGeminiErrorMessage(err);
      console.error('Gemini generate-fighter error:', err);
      return res.status(500).json({ error: message });
    }
  });

  // STEP 3B: Structured AI Skill Card Generator (Gemini API + JSON Schema)
  app.post('/api/ai/generate-card', async (req, res) => {
    try {
      const prompt =
        typeof req.body?.prompt === 'string' && req.body.prompt.trim().length > 0
          ? req.body.prompt.trim()
          : 'A creative Myanmar Lethwei elbow, takedown, or MMA submission technique';
      const lang = req.body?.lang === 'my' ? 'my' : 'en';

      const ai = getGeminiClient();

      const response = await withGeminiRetry(() =>
        ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Design a balanced, legal Skill Card for "Lethwei Kings: Tactical MMA & Striking Federation" based on: "${prompt}".

TACTICAL MMA & LETHWEI RULES:
- Supports Standing, Clinch, and Ground combat: Punches, Kicks, Elbows, Knees, Headbutts, Clinch, Takedowns, Ground & Pound, Submissions, Sprawls, Hip Escapes, and Standing Defense/Counters.
- Balancing rules:
  * tier: 'I' (basic), 'II' (advanced), or 'III' (elite finisher).
  * position: 'Standing', 'Clinch', 'Ground', or 'Any'.
  * staCost: integer 1 to 4.
  * power: for Striking, 4 to 15 (higher power must cost >= 2 STA and >= 2 SPD); for Defense, 4 to 12.
  * speed: integer 1 to 5 (1 = fastest priority, 5 = heaviest/slowest).
  * description: punchy 1-line card text (under 75 chars).
${lang === 'my' ? '- LANGUAGE REQUIREMENT: Write the card "name" and "description" in natural Burmese (Myanmar Unicode script). Keep all enum fields in exact English schema values.' : ''}`,
        config: {
          systemInstruction:
            'You are a lead combat designer for a 2D Turn-Based Lethwei & Tactical MMA card game. Return balanced cards matching the exact JSON schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Short vivid skill card title (2-4 words)' },
              discipline: {
                type: Type.STRING,
                enum: ['Lethwei', 'Muay Thai', 'Kickboxing', 'Boxing', 'Karate', 'Wrestling', 'BJJ', 'MMA'],
              },
              category: {
                type: Type.STRING,
                enum: ['Striking', 'Defense'],
              },
              tier: {
                type: Type.STRING,
                enum: ['I', 'II', 'III'],
              },
              position: {
                type: Type.STRING,
                enum: ['Standing', 'Clinch', 'Ground', 'Any'],
              },
              skillKey: {
                type: Type.STRING,
                enum: [
                  'Punches',
                  'Elbows',
                  'Knees',
                  'High_Kicks',
                  'Low_Kicks',
                  'Clinchwork',
                  'Takedowns',
                  'Ground_Grappling',
                  'Submission',
                  'Strike_Def',
                  'Knees_Def',
                  'Kick_Def',
                  'Takedown_Def',
                  'Submission_Def',
                ],
              },
              staCost: { type: Type.INTEGER, description: 'Stamina cost 1 to 4' },
              power: { type: Type.INTEGER, description: 'DMG or DEF value between 4 and 15' },
              speed: { type: Type.INTEGER, description: 'Speed priority 1 (fastest) to 5 (slowest)' },
              strikeZone: {
                type: Type.STRING,
                enum: ['Head', 'Body', 'Legs', 'Clinch', 'All'],
              },
              artType: {
                type: Type.STRING,
                enum: [
                  'jab',
                  'cross',
                  'hook',
                  'uppercut',
                  'superman',
                  'roundhouse',
                  'sidekick',
                  'teep',
                  'lowkick',
                  'axekick',
                  'elbow',
                  'upwardelbow',
                  'knee',
                  'headbutt',
                  'slam',
                  'takedown',
                  'groundpound',
                  'submission',
                  'escape',
                  'block',
                  'evade',
                  'sprawl',
                  'catchkick',
                  'parry',
                  'shincheck',
                  'shoulderroll',
                  'longguard',
                ],
              },
              specialEffect: {
                type: Type.STRING,
                enum: [
                  'none',
                  'bleed_cut',
                  'drain_sta',
                  'reset_distance',
                  'slow_opponent',
                  'full_evade',
                  'anti_clinch',
                  'catch_kick',
                  'parry_counter',
                  'takedown',
                  'enter_clinch',
                  'stand_up',
                  'submission_lock',
                  'submission_escape',
                ],
              },
              description: { type: Type.STRING, description: 'Concise tactical effect text' },
            },
            required: [
              'name',
              'discipline',
              'category',
              'tier',
              'position',
              'skillKey',
              'staCost',
              'power',
              'speed',
              'strikeZone',
              'artType',
              'specialEffect',
              'description',
            ],
          },
        },
      }));

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        return res.status(502).json({ error: 'Gemini returned an empty skill card response.' });
      }
      const parsed = JSON.parse(rawText);
      return res.json({ card: parsed });
    } catch (err: unknown) {
      const message = extractGeminiErrorMessage(err);
      console.error('Gemini generate-card error:', err);
      return res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lethwei Kings server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
