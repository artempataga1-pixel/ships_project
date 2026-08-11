/* Заглушка блока, для которого контента ещё нет. Сдержанная панель без
   кричащих бейджей — блок виден в структуре, но не притворяется наполненным.

   Переехала сюда из page.tsx: теперь пустое состояние обрабатывают сами блоки
   («Связанные кейсы», «Публикации»), потому что у каждого из них собственная
   шапка — заголовок должен показываться и тогда, когда список пуст. У пилотной
   практики «Банкротство» и кейсы, и публикации есть, но остальные четыре
   практики приедут неравномерно. */
export function ComingSoonPanel({ title }: { title: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8 md:p-10"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-[24%] h-[52%] w-[3px] bg-[var(--color-lime)] opacity-45"
      />
      <p className="font-heading text-base font-extrabold text-[var(--color-text)] md:text-lg">{title}</p>
      <p className="mt-3 text-base leading-relaxed text-[var(--color-muted)]">
        Материалы по этой практике готовятся.
      </p>
    </div>
  )
}
