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
 * User attaches the PDF and copies the JSON from a fenced code block in the reply.
 */
export function buildDietExtractionPrompt(): string {
  return `You are a data extraction assistant. The user attached a Brazilian nutrition meal plan PDF ("Plano Alimentar").

Extract ALL data for the My Diet app and reply with **one** markdown code block — nothing else before or after it.

## Output format (mandatory)

Put the full JSON object inside a single fenced block, exactly like this:

\`\`\`json
{
  "patientName": "...",
  ...
}
\`\`\`

Rules for the block:
- Opening fence must be \`\`\`json (lowercase) on its own line.
- Closing fence must be \`\`\` on its own line.
- Inside the fence: valid JSON only — no comments, no trailing commas, no \`null\` (use \`""\` for empty strings).
- Pretty-print with 2-space indent.
- Do NOT add any text, headings, or explanations outside the code block.
- Do NOT add a second copy of the JSON outside the fence.
- Do NOT offer a separate download/file unless the user asks; the code block is the deliverable.

${EXTRACTION_RULES}

${JSON_SCHEMA}

## Quality check (before replying)

- JSON parses with JSON.parse without errors
- At least 1 menu with meals
- Every meal has preparations with at least one food when the PDF lists foods
- patientName and date match the PDF

Reply with only the \`\`\`json code block.`
}
