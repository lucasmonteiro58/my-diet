/** Suggested filename pattern the AI should use when exporting a JSON file. */
export const DIET_JSON_FILENAME = 'plano-alimentar.json'

const PDF_STRUCTURE = `## How this PDF is laid out (read carefully)

Brazilian "Plano Alimentar" PDFs from nutritionists use a **4-column table**:

| REFEIÇÃO | PREPARAÇÕES | ALIMENTOS | QUANTIDADES |

- **REFEIÇÃO**: meal name + time (e.g. "DESJEJUM" + "06:00", "LANCHE" + "08:00 – 08:30", "LANCHE 1" + "14:00").
- **PREPARAÇÕES**: group label (Fruta, Salada Crua, Sanduíche de Frango e Queijo, Shake de Proteína…). Can span multiple lines.
- **ALIMENTOS**: food name, one per row when multiple items.
- **QUANTIDADES**: portion text exactly as written (e.g. "2 colheres de sopa (50g)", "À vontade"). May span 2 lines (e.g. "1 unidade média" + "(80g)" → join as "1 unidade média (80g)").

Sections in order:
1. Header: patient name, date "Plano Alimentar – DD/MM/YYYY", nutritionist WhatsApp/email.
2. Macro row: Energia (kcal), Carboidratos, Proteínas, Lipídios, Fibras, Peso (kg).
3. One or more **CARDÁPIO N (subtitle)** blocks (e.g. "CARDÁPIO 1 (Dias de Semana)").
4. Inside each cardápio: all meals until the next CARDÁPIO or "Suplementação".
5. **Suplementação** table.
6. **Recomendações Gerais** bullets.

Critical rules:
- Do NOT invent foods. Copy names and quantities verbatim from the PDF.
- "OU" between options → list each option as a separate food in the same preparation.
- "Observações:" paragraphs belong in that meal's "notes" field (full text, one string).
- Empty preparation name is OK only if the PDF has a single block; prefer the PREPARAÇÕES label when present.
- Each CARDÁPIO is a separate object in "menus" — never merge cardápios.`

const EXTRACTION_RULES = `## Field mapping

1. **patientName** — line below "Plano Alimentar – date".
2. **date** — from "Plano Alimentar – DD/MM/YYYY".
3. **nutritionist** — whatsapp + email from header/footer.
4. **macros** — numbers only (comma → dot for weight): energyKcal, carbsG, proteinG, lipidsG, fiberG, weightKg.
5. **menus[]** — one per "CARDÁPIO N (subtitle)":
   - title: "Cardápio N"
   - subtitle: text in parentheses
   - meals[] — every REFEIÇÃO in that cardápio
6. **meal** — name (Desjejum, Lanche, Lanche 1, Almoço, Jantar…), time exactly as PDF.
7. **preparations[]** — each PREPARAÇÕES group with foods[] { name, quantity }.
8. **supplements[]** — from Suplementação section.
9. **generalRecommendations[]** — one string per bullet from Recomendações Gerais.
10. Use "" not null. ids: menu-1, meal-1-1, meal-1-2…`

const JSON_SCHEMA = `## JSON schema

{
  "patientName": "Lucas Monteiro",
  "date": "22/05/2026",
  "nutritionist": { "name": "", "whatsapp": "(85) 9 8179-4055", "email": "gabrielpaesnutri@gmail.com" },
  "macros": { "energyKcal": 1620, "carbsG": 203, "proteinG": 148, "lipidsG": 24, "fiberG": 26, "weightKg": 66.7 },
  "menus": [
    {
      "id": "menu-1",
      "title": "Cardápio 1",
      "subtitle": "Dias de Semana",
      "meals": [
        {
          "id": "meal-1-1",
          "name": "Desjejum",
          "time": "06:00",
          "preparations": [
            {
              "name": "Fruta",
              "foods": [{ "name": "Banana", "quantity": "1 unidade média (80g)" }]
            },
            {
              "name": "Musculação — Sanduíche de Frango e Queijo + Café",
              "foods": [
                { "name": "Pão de Forma", "quantity": "2 fatias (50g)" },
                { "name": "Frango Desfiado", "quantity": "2 colheres de sopa (50g)" },
                { "name": "Queijo Coalho", "quantity": "2 fatias (30g)" },
                { "name": "Café c/ Adoçante", "quantity": "1 xícara (150ml)" }
              ]
            }
          ],
          "notes": ""
        }
      ]
    }
  ],
  "supplements": [{ "name": "Creatina", "dose": "5g (1 colher de café) por dia", "recommendation": "...", "options": "..." }],
  "generalRecommendations": ["Beber pelo menos 2,0 litros de água..."]
}`

const QUALITY_CHECK = `## Before responding, verify

- All CARDÁPIO sections from the PDF are present in menus[].
- Each meal has correct time and all foods from QUANTIDADES column.
- Macros match the PDF table (not estimated).
- JSON is valid and complete.`

/** Prompt for in-app Gemini API — returns JSON only. */
export function buildGeminiExtractionPrompt(): string {
  return `You are an expert extractor for Brazilian nutrition meal plan PDFs ("Plano Alimentar").

Read the ENTIRE attached PDF page by page. Extract data into ONE JSON object for the My Diet app.

Return ONLY valid JSON. No markdown. No code fences. No commentary.

${PDF_STRUCTURE}

${EXTRACTION_RULES}

${JSON_SCHEMA}

The example values above illustrate STRUCTURE only — replace every value with data from THIS PDF.

${QUALITY_CHECK}`
}

/**
 * Prompt for manual use in Gemini web / ChatGPT.
 */
export function buildDietExtractionPrompt(): string {
  return `You are an expert extractor for Brazilian nutrition meal plan PDFs ("Plano Alimentar").

Extract ALL data for the My Diet app and reply with **one** markdown code block — nothing else.

\`\`\`json
{ ... }
\`\`\`

${PDF_STRUCTURE}

${EXTRACTION_RULES}

${JSON_SCHEMA}

${QUALITY_CHECK}

Reply with only the \`\`\`json code block.`
}
