import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    // remove spaces / quotes that may be copied by mistake
    const key = process.env.GEMINI_API_KEY.trim().replace(/^["']|["']$/g, '');
    // Default = normal Gemini Developer API (free tier). Vertex mode needs billing,
    // so it is used ONLY when GEMINI_MODE="vertex" is written in the .env file.
    const mode = (process.env.GEMINI_MODE || 'developer').trim().toLowerCase();
    if (mode === 'vertex') {
      console.log('Gemini client mode: Vertex AI express');
      aiClient = new GoogleGenAI({ vertexai: true, apiKey: key });
    } else {
      console.log('Gemini client mode: Gemini Developer API');
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

export function isGeminiApiKeyAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
}

export interface AnalysisResponse {
  isLeaf: boolean;
  crop: string;
  healthStatus: 'Healthy' | 'Diseased' | 'Uncertain';
  disease: string;
  confidence: number | null;
  severity: 'Low' | 'Moderate' | 'High' | null;
  affectedAreaPercentage: number | null;
  symptoms: string[];
  aiExplanation: string;
  recommendedAction: string;
  language?: string;
}

export function getLanguageName(lang?: string): 'English' | 'Marathi' | 'Hindi' {
  if (!lang) return 'English';
  const l = lang.toLowerCase().trim();
  if (l === 'mr' || l === 'marathi' || l.includes('मराठी')) return 'Marathi';
  if (l === 'hi' || l === 'hindi' || l.includes('हिंदी')) return 'Hindi';
  return 'English';
}

/* ------------------------------------------------------------------ */
/* Helpers: 429 (quota) retry                                          */
/* ------------------------------------------------------------------ */
function isQuotaError(err: any): boolean {
  const msg = String(err?.message || err || '');
  return err?.status === 429 || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED');
}

function getRetryDelayMs(err: any): number {
  const msg = String(err?.message || err || '');
  const m = msg.match(/retry in ([\d.]+)\s*(ms|s)/i);
  if (m) {
    const v = parseFloat(m[1]);
    const ms = m[2].toLowerCase() === 'ms' ? v : v * 1000;
    return Math.min(Math.max(ms, 1000), 20000);
  }
  return 5000;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Model name (can be changed from the .env file with GEMINI_MODEL=...)
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

// Daily free-tier quota handling: when the DAILY limit is finished, stop calling Gemini
// (every extra call is useless) until the quota resets.
let quotaBlockedUntil = 0;

function isDailyQuotaError(err: any): boolean {
  const msg = String(err?.message || err || '');
  return msg.includes('PerDay') || /retry in \d+h/i.test(msg);
}

function getQuotaBlockMs(err: any): number {
  const msg = String(err?.message || err || '');
  const m = msg.match(/"retryDelay":"(\d+)s"/);
  if (m) return Math.min(parseInt(m[1], 10) * 1000, 6 * 3600 * 1000);
  return 30 * 60 * 1000;
}

function blockForDailyQuota(err: any) {
  // Print what Google really said (which model, which limit) so the cause is visible
  console.warn(
    `Google quota details (model in use: ${MODEL}):`,
    String(err?.message || err).replace(/\s+/g, ' ').slice(0, 700)
  );
  const ms = getQuotaBlockMs(err);
  quotaBlockedUntil = Date.now() + ms;
  console.warn(
    `Gemini DAILY free quota is finished. AI calls paused for about ${Math.round(ms / 60000)} minutes. ` +
      'Use a new API key (from a NEW project) in .env, or enable billing, then restart the server.'
  );
}

function isQuotaBlocked(): boolean {
  return Date.now() < quotaBlockedUntil;
}

const DAILY_LIMIT_MESSAGE =
  'AI daily free limit reached. Please try again later or use a new API key.';

// Gemini sometimes returns slightly broken JSON (extra text, code fences). Try to rescue it.
function parseJsonLoose(text: string | undefined): any | null {
  if (!text) return null;
  const t = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(t);
  } catch {
    // try only the part between the first { and the last }
  }
  const a = t.indexOf('{');
  const b = t.lastIndexOf('}');
  if (a >= 0 && b > a) {
    try {
      return JSON.parse(t.slice(a, b + 1));
    } catch {
      // give up
    }
  }
  return null;
}

// "This model is currently experiencing high demand" (HTTP 503) is a temporary Google-side problem.
function isOverloadedError(err: any): boolean {
  const msg = String(err?.message || err || '');
  return err?.status === 503 || msg.includes('UNAVAILABLE') || msg.includes('high demand');
}

// Runs a Gemini call. Retries on temporary problems (503 overloaded, per-minute 429).
// Stops immediately when the DAILY quota is finished.
async function withRetry<T>(fn: () => Promise<T>, label: string, maxRetries = 3): Promise<T> {
  let lastErr: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      if (isDailyQuotaError(err)) {
        blockForDailyQuota(err);
        throw new Error(DAILY_LIMIT_MESSAGE);
      }
      const temporary = isOverloadedError(err) || isQuotaError(err);
      if (!temporary || attempt === maxRetries) break;
      const wait = isQuotaError(err) ? getRetryDelayMs(err) : 2500 * (attempt + 1);
      console.warn(`${label}: Gemini temporary problem (${err?.status || 'error'}). Retry ${attempt + 1}/${maxRetries} in ${Math.round(wait / 1000)}s...`);
      await sleep(wait);
    }
  }
  if (isOverloadedError(lastErr) || isQuotaError(lastErr)) {
    throw new Error('AI is busy, please try again in a few seconds');
  }
  throw new Error('AI analysis failed: ' + (lastErr?.message || 'unknown error'));
}

/**
 * Analyze plant leaf image with Gemini Vision.
 * The crop is decided ONLY from the image. If Gemini fails, an error is thrown
 * (no fake / random result is ever returned).
 */
export async function analyzeLeafImage(
  base64Image: string,
  mimeType: string = 'image/jpeg',
  _selectedCrop?: string, // kept for compatibility, intentionally NOT used
  language: string = 'en'
): Promise<AnalysisResponse> {
  const ai = getGenAI();
  if (!ai) {
    throw new Error('Gemini API key is missing. Add GEMINI_API_KEY in the .env file.');
  }

  if (isQuotaBlocked()) {
    throw new Error(DAILY_LIMIT_MESSAGE);
  }

  const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
  const langName = getLanguageName(language);

  const cropExample =
    langName === 'Marathi' ? 'टोमॅटो (Tomato)' : langName === 'Hindi' ? 'टमाटर (Tomato)' : 'Tomato';

  const diseaseExample =
    langName === 'Marathi'
      ? 'करपा / अर्ली ब्लाईट (Early Blight)'
      : langName === 'Hindi'
      ? 'अगेती झुलसा (Early Blight)'
      : 'Early Blight (Alternaria solani)';

  const healthyLabel =
    langName === 'Marathi'
      ? 'निरोगी वनस्पती (Healthy Foliage)'
      : langName === 'Hindi'
      ? 'स्वस्थ पौधा (Healthy Foliage)'
      : 'None detected (Healthy Foliage)';

  const prompt = `You are the AGRI-SCAN BOT Autonomous Plant Pathology & Botanical Vision Model.
Carefully analyze this leaf photograph.

AUTONOMOUS CROP SPECIES IDENTIFICATION:
- Autonomously identify the EXACT crop/plant species by closely examining leaf margin, leaf shape, venation, petiole, lobe patterns, and texture.
- Do NOT assume or default to any crop. Identify whichever plant is actually in the photo (e.g., Maize/Corn, Cotton, Soybean, Potato, Tomato, Onion, Grape, Sugarcane, Wheat, Chilli/Pepper, Brinjal/Eggplant, Rice/Paddy, Papaya, Mango, Banana, Rose, Cucumber, Okra/Ladyfinger, Citrus/Lemon, etc.).
- Determine the species purely from visual features.

CRITICAL LANGUAGE INSTRUCTION:
Respond ONLY in ${langName}. Write all fields (crop, disease, visible symptoms, botanical assessment, recommended action) in ${langName}. Keep JSON keys in English.
Disease and crop names should be shown in ${langName}, with the English name in brackets. Example crop: "${cropExample}", example disease: "${diseaseExample}".

Pathology Rules:
1. Verify if the image contains visible plant foliage or a leaf. If it is NOT a leaf, return isLeaf: false, healthStatus: "Uncertain".
2. Give the crop's COMMON farmer-friendly name in ${langName}, with the English common name in brackets (for example Cabbage, Tomato, Grape). Do NOT answer with only the scientific (Latin) name; you may add the scientific name after the English common name.
3. Identify if it is "Healthy", "Diseased", or "Uncertain".
4. If diseased, identify the specific plant disease with the ${langName} name and English name in brackets. If healthy, state "${healthyLabel}".
5. Confidence: give an honest number between 0 and 1. If the image is unclear or you are unsure, give a low value.
6. Severity: "Low", "Moderate", "High" (or null if healthy).
7. Affected area: realistic estimated percentage of leaf area covered by lesions (0 if healthy).
8. Visible symptoms: 2-3 specific botanical observations in ${langName}.
9. Explanation: 2-3 sentences of objective botanical description in ${langName}.
10. Recommended action: In ${langName}, state practical non-chemical cultural advice (sanitation, pruning, irrigation). Always begin with the recommendation to inspect the plant and field before applying treatment.

Return ONLY a valid JSON object matching this schema:
{
  "isLeaf": true,
  "crop": "Common crop name in ${langName} (English common name in brackets)",
  "healthStatus": "Healthy" | "Diseased" | "Uncertain",
  "disease": "Recognized disease name in ${langName} (English in brackets)",
  "confidence": 0.88,
  "severity": "Low" | "Moderate" | "High" | null,
  "affectedAreaPercentage": 14.5,
  "symptoms": ["${langName} symptom 1", "${langName} symptom 2"],
  "aiExplanation": "${langName} botanical assessment...",
  "recommendedAction": "${langName} recommended action..."
}`;

  const callGemini = () =>
    ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: cleanBase64, mimeType: mimeType || 'image/jpeg' } },
            { text: prompt },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    });

  const t0 = Date.now();
  let response = await withRetry(callGemini, 'Leaf analysis');
  let parsed: any = parseJsonLoose(response.text);
  if (!parsed) {
    console.warn('Leaf analysis: Gemini returned broken JSON, trying once more...');
    response = await withRetry(callGemini, 'Leaf analysis (JSON retry)', 1);
    parsed = parseJsonLoose(response.text);
  }
  if (!parsed) {
    throw new Error('AI returned an invalid response, please try again');
  }

  console.log(`Leaf analysis (${langName}) took ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  const isLeaf = parsed.isLeaf ?? true;
  if (isLeaf && !parsed.crop) {
    throw new Error('AI could not identify the crop, please retake the photo');
  }

  return {
    isLeaf,
    crop: parsed.crop || '',
    healthStatus: parsed.healthStatus || 'Uncertain',
    disease: parsed.disease || '',
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : null,
    severity: parsed.severity || null,
    affectedAreaPercentage:
      typeof parsed.affectedAreaPercentage === 'number' ? parsed.affectedAreaPercentage : null,
    symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : [],
    aiExplanation: parsed.aiExplanation || '',
    recommendedAction:
      parsed.recommendedAction || 'Inspect the plant and field before applying treatment.',
    language: langName,
  };
}

/* ------------------------------------------------------------------ */
/* Translation of an existing scan (no new photo needed)               */
/* Safe: never changes the result if Gemini fails.                     */
/* ------------------------------------------------------------------ */
const translationCache = new Map<string, any>();
const translationFailedAt = new Map<string, number>();

async function translateScanRecordInner(
  scanData: {
    crop: string;
    disease: string;
    healthStatus: string;
    symptoms: string[];
    aiExplanation: string;
    recommendedAction: string;
  },
  targetLanguage: string
): Promise<{
  crop: string;
  disease: string;
  symptoms: string[];
  aiExplanation: string;
  recommendedAction: string;
}> {
  const langName = getLanguageName(targetLanguage);
  const ai = getGenAI();

  // Only short text fields are sent. The photo (imagePath / base64) is NEVER sent.
  const payload = {
    crop: scanData.crop,
    disease: scanData.disease,
    healthStatus: scanData.healthStatus,
    symptoms: scanData.symptoms,
    aiExplanation: scanData.aiExplanation,
    recommendedAction: scanData.recommendedAction,
  };

  const original = {
    crop: scanData.crop,
    disease: scanData.disease,
    symptoms: scanData.symptoms,
    aiExplanation: scanData.aiExplanation,
    recommendedAction: scanData.recommendedAction,
  };

  const cacheKey = JSON.stringify([payload.crop, payload.disease, payload.aiExplanation, langName]);

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // If this same text failed recently, do not call Gemini again for 15 seconds
  const failedAt = translationFailedAt.get(cacheKey);
  if (failedAt && Date.now() - failedAt < 15000) {
    return original;
  }

  if (!ai) return original;
  if (isQuotaBlocked()) return original;

  try {
    const prompt = `You are the AGRI-SCAN BOT Plant Pathology Localization Engine.
Translate the following botanical diagnosis report strictly into ${langName}.

Rules:
1. Translate all text fields into fluent, natural, farmer-friendly ${langName}.
2. Disease and crop names should be shown in ${langName}, with the English name in brackets.
3. Keep the JSON keys in English as specified.

Input Data:
${JSON.stringify(payload, null, 2)}

Return ONLY valid JSON matching this schema:
{
  "crop": "Crop name in ${langName} (with English in brackets)",
  "disease": "Disease name in ${langName} (with English in brackets)",
  "symptoms": ["symptom 1 in ${langName}", "symptom 2 in ${langName}"],
  "aiExplanation": "Botanical assessment in ${langName}",
  "recommendedAction": "Recommended action in ${langName}"
}`;

    const callTranslate = () =>
      ai.models.generateContent({
        model: MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
      });

    const tt0 = Date.now();
    let response = await withRetry(callTranslate, 'Translation', 2);
    let parsed: any = parseJsonLoose(response.text);
    if (!parsed) {
      console.warn('Translation: Gemini returned broken JSON, trying once more...');
      response = await withRetry(callTranslate, 'Translation (JSON retry)', 1);
      parsed = parseJsonLoose(response.text);
    }
    if (!parsed) throw new Error('Translation returned invalid JSON');
    console.log(`Translation to ${langName} OK in ${((Date.now() - tt0) / 1000).toFixed(1)}s`);
    const result = {
      crop: parsed.crop || scanData.crop,
      disease: parsed.disease || scanData.disease,
      symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : scanData.symptoms,
      aiExplanation: parsed.aiExplanation || scanData.aiExplanation,
      recommendedAction: parsed.recommendedAction || scanData.recommendedAction,
    };
    translationCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('Scan translation failed, keeping the original result:', (err as any)?.message || err);
    translationFailedAt.set(cacheKey, Date.now());
    return original;
  }
}

// Same translation requested many times at once (client sends repeated requests):
// run Gemini only ONCE and share the result.
const translateInflight = new Map<string, Promise<any>>();

export function translateScanRecord(...args: Parameters<typeof translateScanRecordInner>) {
  const [scanData, targetLanguage] = args;
  const key = JSON.stringify([
    scanData.crop,
    scanData.disease,
    scanData.aiExplanation,
    getLanguageName(targetLanguage),
  ]);
  const running = translateInflight.get(key);
  if (running) return running as ReturnType<typeof translateScanRecordInner>;
  const p = translateScanRecordInner(...args).finally(() => translateInflight.delete(key));
  translateInflight.set(key, p);
  return p;
}

/* ------------------------------------------------------------------ */
/* Multilingual Kisan AI Assistant                                     */
/* ------------------------------------------------------------------ */
export async function askCropAssistant(
  query: string,
  history: Array<{ role: string; content: string }>,
  options?: {
    language?: string;
    latestScan?: {
      crop?: string;
      disease?: string;
      healthStatus?: string;
      severity?: string | null;
      affectedAreaPercentage?: number | null;
      symptoms?: string[];
      aiExplanation?: string;
      recommendedAction?: string;
    } | null;
  }
) {
  const langName = getLanguageName(options?.language);
  const ai = getGenAI();

  let scanContextStr = '';
  if (options?.latestScan) {
    const s = options.latestScan;
    scanContextStr = `
=== LATEST LEAF SCAN CONTEXT FOR THIS FARMER ===
- Crop: ${s.crop || 'Unknown'}
- Health Status: ${s.healthStatus || 'Unknown'}
- Identified Disease/Condition: ${s.disease || 'None'}
- Severity: ${s.severity || 'N/A'}
- Affected Foliage Area: ${s.affectedAreaPercentage ?? 'N/A'}%
- Symptoms Observed: ${s.symptoms?.join('; ') || 'N/A'}
- Botanical Diagnosis: ${s.aiExplanation || 'N/A'}
- Recommended Action: ${s.recommendedAction || 'N/A'}
=================================================
Use this leaf scan context to directly answer questions if the farmer asks about their scanned leaf, symptoms, or what to do next.`;
  }

  if (ai && !isQuotaBlocked()) {
    try {
      const systemInstruction = `You are Kisan AI (किसान AI / किसान मित्र), the expert multilingual agricultural companion and robot scouting specialist inside AGRI-SCAN BOT.

LANGUAGE GUIDELINES:
1. The user's currently selected language is ${langName}. You MUST reply in ${langName} by default.
2. If the user types their message in Marathi (देवनागरी / मराठी), reply in Marathi.
3. If the user types their message in Hindi (देवनागरी / हिंदी), reply in Hindi.
4. If the user types in English, reply in ${langName}.

AGRONOMIC GUIDELINES:
- Provide clear, practical, farmer-friendly advice.
- Emphasize integrated pest management (IPM), cultural sanitation, and organic remedies (e.g. neem oil, trichoderma, pruning, drip management).
- Always include the decision-support reminder: inspect the plant and field before applying chemical treatments, and consult local Krishi Vigyan Kendra (KVK) for regional chemical dosages.
${scanContextStr}`;

      const contents = history.map((h) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      }));

      contents.push({
        role: 'user',
        parts: [{ text: query }],
      });

      const response = await ai.models.generateContent({
        model: MODEL,
        contents,
        config: {
          systemInstruction,
          temperature: 0.35,
        },
      });

      return response.text || 'I could not process your query at this moment. Please try again.';
    } catch (e) {
      if (isDailyQuotaError(e)) blockForDailyQuota(e);
      else console.warn('AI assistant API error:', e);
    }
  }

  // Simple fallback when the AI is temporarily unavailable
  if (langName === 'Marathi') {
    return 'AI सहाय्यक सध्या व्यस्त आहे. कृपया काही सेकंदांनी पुन्हा प्रयत्न करा. फवारणीपूर्वी शेताची पाहणी करा आणि स्थानिक कृषी विज्ञान केंद्र (KVK) चा सल्ला घ्या.';
  } else if (langName === 'Hindi') {
    return 'AI सहायक अभी व्यस्त है। कृपया कुछ सेकंड बाद फिर प्रयास करें। उपचार से पहले खेत का निरीक्षण करें और कृषि विज्ञान केंद्र (KVK) से सलाह लें।';
  }
  return 'The AI assistant is temporarily busy. Please try again in a few seconds. Inspect your field before any treatment and consult your local Krishi Vigyan Kendra (KVK).';
}