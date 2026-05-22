/** Suggested filename pattern the AI should use when exporting a JSON file. */
export const DIET_JSON_FILENAME = 'plano-alimentar.json'

const EXTRACTION_RULES = `## Extraction rules

1. Extract every "Cardápio N (subtitle)" as a separate menu.
2. Meals: Desjejum, Lanche, Lanche 1, Lanche 2, Almoço, Jantar, Ceia, etc. — keep exact times from the PDF.
3. Group items under "preparations" (Fruta, Salada Crua, Sanduíche…, Shake…).
4. Each food: "name" + "quantity" (full text from QUANTIDADES, including grams).
5. "OU" options → separate food objects in the same preparation.
6. "Observações:" → meal "notes" (one string).
7. Macros as numbers only (dot for decimals): energyKcal, carbsG, proteinG, lipidsG, fiberG, weightKg.
8. Suplementação → "supplements" array.
9. Recomendações Gerais → "generalRecommendations" (one string per bullet).
10. Nutritionist whatsapp + email from PDF header/footer.
11. Use "" for missing strings, never null.
12. ids: "menu-1", "meal-1-1", etc.`

const JSON_SCHEMA = `## JSON schema (strict)

{
  "patientName": "string",
  "date": "DD/MM/YYYY",
  "nutritionist": {
    "name": "string",
    "whatsapp": "string",
    "email": "string"
  },
  "macros": {
    "energyKcal": 0,
    "carbsG": 0,
    "proteinG": 0,
    "lipidsG": 0,
    "fiberG": 0,
    "weightKg": 0
  },
  "menus": [
    {
      "id": "menu-1",
      "title": "Cardápio 1",
      "subtitle": "string",
      "meals": [
        {
          "id": "meal-1-1",
          "name": "Desjejum",
          "time": "06:00",
          "preparations": [
            {
              "name": "Fruta",
              "foods": [
                { "name": "Banana", "quantity": "1 unidade média (80g)" }
              ]
            }
          ],
          "notes": ""
        }
      ]
    }
  ],
  "supplements": [
    {
      "name": "Creatina",
      "dose": "string",
      "recommendation": "string",
      "options": "string"
    }
  ],
  "generalRecommendations": ["string"]
}`

/** Prompt for in-app Gemini API — returns JSON only. */
export function buildGeminiExtractionPrompt(): string {
  return `You are a data extraction assistant. Read the attached Brazilian nutrition meal plan PDF ("Plano Alimentar") and extract ALL data.

Return ONLY a valid JSON object matching the schema below. No markdown, no code fences, no explanation.

${EXTRACTION_RULES}

${JSON_SCHEMA}

Quality: JSON must parse with JSON.parse; at least 1 menu with meals; patientName and date must match the PDF.`
}

/**
 * Prompt for manual use in Gemini web / ChatGPT.
 * User attaches the PDF and asks the AI to produce a downloadable JSON file.
 */
export function buildDietExtractionPrompt(): string {
  return `You are a data extraction assistant. The user attached a Brazilian nutrition meal plan PDF ("Plano Alimentar").

Your task: extract ALL information and deliver it as a **downloadable JSON file** for the My Diet mobile app.

## Required deliverables (both)

1. **JSON file (primary)** — Create and offer a downloadable file named exactly:
   \`${DIET_JSON_FILENAME}\`
   - In Gemini: use Canvas / export / "download file" if available, or provide a single \`.json\` attachment the user can save.
   - In ChatGPT: use Advanced Data Analysis to write the file and let the user download it.
   - The file must be valid UTF-8 JSON (pretty-printed with 2-space indent is OK).

2. **Same JSON in the chat (backup)** — After the file, paste the raw JSON object once more so the user can copy if download fails. No markdown fences in the pasted JSON block.

Do NOT wrap the downloadable file content in \`\`\`json\`\`\`. Do NOT add explanations inside the JSON.

${EXTRACTION_RULES}

${JSON_SCHEMA}

## Quality check before sending

- JSON parses with JSON.parse without errors
- At least 1 menu with meals
- Every meal has preparations with at least one food when the PDF lists foods
- patientName and date match the PDF

Start by confirming you read the PDF, then provide the file \`${DIET_JSON_FILENAME}\`, then the raw JSON backup.`
}
