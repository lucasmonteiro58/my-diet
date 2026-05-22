import { readFileSync } from 'fs'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

const data = new Uint8Array(
  readFileSync('/Users/lumr/Downloads/Plano Alimentar Lucas Monteiro 22-05-26.pdf'),
)

const pdf = await getDocument({ data, useSystemFonts: true }).promise

for (let pageNum = 1; pageNum <= Math.min(2, pdf.numPages); pageNum++) {
  const page = await pdf.getPage(pageNum)
  const content = await page.getTextContent()
  console.log(`\n=== PAGE ${pageNum} ===\n`)

  const items = content.items
    .filter((x) => 'str' in x && x.str.trim())
    .map((x) => ({
      str: x.str.trim(),
      x: Math.round(x.transform[4]),
      y: Math.round(x.transform[5]),
    }))

  // Cluster by Y (rows)
  items.sort((a, b) => b.y - a.y || a.x - b.x)
  const rows = []
  for (const it of items) {
    const row = rows.find((r) => Math.abs(r.y - it.y) <= 4)
    if (row) row.cells.push(it)
    else rows.push({ y: it.y, cells: [it] })
  }

  for (const row of rows) {
    row.cells.sort((a, b) => a.x - b.x)
    const line = row.cells.map((c) => `[${c.x}]${c.str}`).join(' | ')
    console.log(line)
  }
}
