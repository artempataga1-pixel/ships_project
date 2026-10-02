// Проверка правок по итогам задачи 14: регалии на мобильных флип-карточках (все пункты, без переполнения),
// кнопка «Узнать больше» на карточках партнёров, пункт меню «О компании», должность Максима.
// node tmp/task14/check-fixes.mjs [port]
import { createRequire } from 'module'
const require = createRequire('file:///D:/IT/VS/demo-site/')
const { chromium } = require('playwright')
const BASE = `http://localhost:${process.argv[2] || 3100}`
const OUT = 'tmp/task14/fix'
const browser = await chromium.launch()
let fails = 0
const ok = (cond, msg) => { console.log(cond ? '  ✓' : '  ✗', msg); if (!cond) fails++ }

async function ctxFor(width, height, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, ...opts })
  await ctx.addInitScript(() => { try { sessionStorage.setItem('logo-intro-played', '1') } catch {} })
  return ctx
}

// A. Мобильные карточки: все регалии, без переполнения — на разных ширинах, обычный и reduced-motion режим
for (const [w, h] of [[320, 640], [360, 780], [390, 844], [430, 932], [768, 1024], [1024, 768], [1180, 820]]) {
  for (const reduced of [false, true]) {
    const ctx = await ctxFor(w, h, { reducedMotion: reduced ? 'reduce' : 'no-preference', hasTouch: true, isMobile: w < 1024 })
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto(BASE + '/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2500)
    const res = await page.evaluate(() => {
      return [...document.querySelectorAll('[role="button"][aria-pressed]')].map((btn) => {
        const ul = btn.querySelector('ul')
        if (!ul) return null
        const lis = [...ul.children]
        const first = lis[0], last = lis[lis.length - 1]
        const content = last.offsetTop + last.offsetHeight - first.offsetTop
        return {
          who: btn.getAttribute('aria-label').split(',')[0],
          items: lis.length,
          font: getComputedStyle(ul).fontSize,
          content, box: ul.clientHeight,
          rendered: ul.offsetParent !== null || ul.getClientRects().length > 0,
        }
      }).filter(Boolean)
    })
    console.log(`${w}×${h}${reduced ? ' reduced' : ''}`)
    for (const r of res) {
      const expected = r.who.startsWith('Шумская') ? 6 : 3
      if (r.box === 0) { console.log(`  · ${r.who}: не в раскладке (скрыт), пропуск`); continue }
      ok(r.items === expected && r.content <= r.box, `${r.who}: пунктов ${r.items}/${expected}, контент ${r.content}px ≤ ${r.box}px, кегль ${r.font}`)
    }
    ok(errors.length === 0, `JS-ошибок нет${errors.length ? ': ' + errors.join(' | ') : ''}`)
    await ctx.close()
  }
}

// A2. Скриншоты перевёрнутой карточки Анны (обычный поток, reduced-motion) + лицевой стороны
for (const [w, h] of [[390, 844], [320, 640], [768, 1024]]) {
  const ctx = await ctxFor(w, h, { reducedMotion: 'reduce', hasTouch: true, isMobile: w < 1024 })
  const page = await ctx.newPage()
  await page.goto(BASE + '/#partners', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  const card = page.locator('[role="button"][aria-label^="Шумская"]').filter({ visible: true }).first()
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
  const holder = card.locator('xpath=..')
  await holder.screenshot({ path: `${OUT}/anna-front-${w}.png` })
  await card.click()
  await page.waitForTimeout(1200)
  await holder.screenshot({ path: `${OUT}/anna-back-${w}.png` })
  await ctx.close()
}

// A3. Компактная карточка внутри мобильного scroll-scrub (390) — скриншот
{
  const ctx = await ctxFor(390, 844, { hasTouch: true, isMobile: true })
  const page = await ctx.newPage()
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  const compactBtns = await page.evaluate(() => [...document.querySelectorAll('#partners-heading-compact')].length)
  console.log('компактный вариант в DOM:', compactBtns)
  await ctx.close()
}

// B. Десктоп: «Узнать больше» видна в правом нижнем углу карточки и ведёт на страницу партнёра
for (const [w, h] of [[1440, 900], [1920, 1080], [1280, 800]]) {
  const ctx = await ctxFor(w, h)
  const page = await ctx.newPage()
  await page.goto(BASE + '/partners/anna-shumskaya', { waitUntil: 'networkidle' })
  await page.goto(BASE + '/#partners', { waitUntil: 'networkidle' })
  await page.waitForTimeout(5000)
  console.log(`desktop ${w}×${h}`)
  for (const who of ['Шумская', 'Посаженников']) {
    const link = page.locator(`a[aria-label="${who === 'Шумская' ? 'Шумская Анна Сергеевна' : 'Посаженников Максим Сергеевич'} — узнать больше"]`).filter({ visible: true }).first()
    const pill = link.locator('span').first()
    const lb = await link.boundingBox(), pb = await pill.boundingBox()
    ok(!!lb && !!pb && pb.x + pb.width > lb.x + lb.width * 0.6 && pb.y + pb.height > lb.y + lb.height * 0.7,
      `${who}: пилюля «${(await pill.textContent())?.trim()}» в правом нижнем углу карточки`)
  }
  await page.screenshot({ path: `${OUT}/partners-desktop-${w}.png` })
  if (w === 1440) {
    const link = page.locator('a[aria-label="Посаженников Максим Сергеевич — узнать больше"]').filter({ visible: true }).first()
    const b = await link.boundingBox()
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 10 })
    await page.waitForTimeout(1500)
    await page.screenshot({ path: `${OUT}/partners-desktop-hover-maksim.png` })
    const pill = link.locator('span').first()
    const pb = await pill.boundingBox()
    await page.mouse.click(pb.x + pb.width / 2, pb.y + pb.height / 2)
    await page.waitForURL('**/partners/maksim-posazhennikov', { timeout: 10000 }).catch(() => {})
    ok(page.url().endsWith('/partners/maksim-posazhennikov'), `клик по «Узнать больше» → ${page.url()}`)
  }
  await ctx.close()
}

// B2. Мобилка: тап по «Узнать больше» ведёт на страницу, а не переворачивает карточку
{
  const ctx = await ctxFor(390, 844, { reducedMotion: 'reduce', hasTouch: true, isMobile: true })
  const page = await ctx.newPage()
  await page.goto(BASE + '/#partners', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  const link = page.locator('a[aria-label="Шумская Анна Сергеевна — узнать больше"]').filter({ visible: true }).first()
  await link.scrollIntoViewIfNeeded()
  await link.tap()
  await page.waitForURL('**/partners/anna-shumskaya', { timeout: 10000 }).catch(() => {})
  ok(page.url().endsWith('/partners/anna-shumskaya'), `мобилка: тап по «Узнать больше» → ${page.url()}`)
  await ctx.close()
}

// C. Меню: «О компании» вместо «О нас»
for (const [w, h] of [[1440, 900], [1280, 800], [390, 844]]) {
  const ctx = await ctxFor(w, h)
  const page = await ctx.newPage()
  await page.goto(BASE + '/partners/anna-shumskaya', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const txt = await page.evaluate(() => document.body.innerText)
  if (w < 1024) {
    const burger = page.locator('header button[aria-label*="еню"]').first()
    if (await burger.count()) { await burger.click(); await page.waitForTimeout(800) }
  }
  const all = await page.evaluate(() => document.body.innerText)
  ok(all.includes('О компании') && !/(^|\n)\s*О нас\s*(\n|$)/.test(all), `${w}: в меню «О компании», «О нас» нет`)
  await page.screenshot({ path: `${OUT}/nav-${w}.png` })
  await ctx.close()
}

// D. Должность Максима на странице партнёра
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await ctxFor(w, h)
  const page = await ctx.newPage()
  await page.goto(BASE + '/partners/maksim-posazhennikov', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  const txt = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
  ok(txt.includes('юридической компании «Шумская и партнёры», руководитель практики «Строительство. Земля. Недвижимость»'), `${w}: полная должность Максима на странице`)
  await page.screenshot({ path: `${OUT}/maksim-page-${w}.png` })
  await ctx.close()
}

await browser.close()
console.log(fails ? `\nПРОВАЛОВ: ${fails}` : '\nВсё прошло')
