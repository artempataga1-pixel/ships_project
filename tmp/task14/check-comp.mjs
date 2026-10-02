// Подзаголовок «Ключевых компетенций» одинаковый (короткий) на всех ширинах
import { createRequire } from 'module'
const require = createRequire('file:///D:/IT/VS/demo-site/')
const { chromium } = require('playwright')
const b = await chromium.launch()
for (const [w, h] of [[1920, 1080], [1440, 900], [1024, 768], [390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } })
  await ctx.addInitScript(() => { try { sessionStorage.setItem('logo-intro-played', '1') } catch {} })
  const p = await ctx.newPage()
  await p.goto('http://localhost:3100/', { waitUntil: 'networkidle' })
  const subs = await p.evaluate(() => [...document.querySelectorAll('#competencies-heading, #competencies-heading-compact')]
    .map((h) => h.parentElement.querySelector('p')?.textContent.trim()))
  const html = await p.content()
  console.log(w, JSON.stringify(subs), html.includes('направления нашей специализации') ? '✗ длинный остался' : '✓ длинного нет')
  await ctx.close()
}
await b.close()
