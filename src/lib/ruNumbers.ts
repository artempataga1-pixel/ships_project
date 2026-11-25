/* Числа в русских подписях — чтобы фразы вида «39 дел по пяти практикам»
   собирались из данных, а не были вписаны руками. */

export function pluralCases(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} дело`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} дела`
  return `${n} дел`
}

// Дательный падеж: «по пяти практикам», «по трём практикам»
const DATIVE = ['', 'одной', 'двум', 'трём', 'четырём', 'пяти', 'шести', 'семи', 'восьми', 'девяти', 'десяти']

export function byPractices(n: number): string {
  if (n === 1) return 'по одной практике'
  return `по ${DATIVE[n] ?? n} практикам`
}

export function pluralPractices(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n}\u00a0практика`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n}\u00a0практики`
  return `${n}\u00a0практик`
}
