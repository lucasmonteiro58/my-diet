/**
 * Prompt for external AI (Gemini, ChatGPT, etc.).
 * User attaches the PDF in the AI chat and pastes this instruction.
 */
export function buildDietExtractionPrompt(): string {
  return `You are a data extraction assistant. The user will attach a Brazilian nutrition meal plan PDF ("Plano Alimentar").

Read the entire PDF carefully and return ONE valid JSON object — no markdown, no code fences, no explanation before or after.

## Rules

1. Extract ALL cardápios (Cardápio 1, 2, 3…) with their subtitle in parentheses (e.g. "Dias de semana").
2. For each meal (Desjejum, Lanche, Lanche 1, Lanche 2, Almoço, Jantar, etc.):
   - Keep the exact time range from the PDF (e.g. "08:00 – 08:30").
   - Group foods under "preparations" (preparações): Fruta, Salada Crua, Sanduíche…, Shake…, etc.
   - Each food must have "name" and "quantity" (full text from the QUANTIDADES column, including grams).
   - If the PDF has "OU" between options, list each option as separate food items in the same preparation.
   - Put "Observações:" text in the meal's "notes" field (single string).
3. Macros: energyKcal (number), carbsG, proteinG, lipidsG, fiberG, weightKg (numbers only, use dot for decimals).
4. Supplements section → "supplements" array.
5. "Recomendações Gerais" → "generalRecommendations" array of strings (one per bullet).
6. Nutritionist contact: whatsapp and email from the PDF header/footer.
7. Use empty string "" for missing text fields; never use null.
8. Generate simple unique string ids: "menu-1", "meal-1-1", etc.

## JSON schema (follow exactly)

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
          "notes": "optional string"
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
}

Return only the JSON object.`
}
