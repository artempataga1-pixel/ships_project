// Вопрос 20: показать главную с 10 опубликованными публикациями.
// node tmp/task12/demo-20.mjs — добавить 6 демо-публикаций к 4 из сида; откат — bash tmp/task12/restore-12.6.sh
import { execSync } from 'child_process'
const psql = (sql) => execSync(`docker exec -i project-yuriki-db-1 psql -U yuriki -d yuriki -At -v ON_ERROR_STOP=1`, { input: sql }).toString().trim()
const demo = [
  ['РБК', 'Как кредитору вернуть деньги, если должник выводит активы', '2025-05-20', 'https://www.rbc.ru/'],
  ['Ведомости', 'Банкротство застройщика: что делать дольщикам', '2025-03-11', null],
  ['Право.ru', 'Субсидиарная ответственность: свежая практика ВС', '2025-02-18', 'https://pravo.ru/'],
  ['Коммерсантъ', 'Корпоративный конфликт: выход участника из ООО', '2024-11-27', null],
  ['Forbes', 'Семейные активы и бизнес: как защитить наследство', '2024-10-09', null],
  ['Интерфакс', 'Оспаривание торгов в банкротстве: разбор дела', '2024-09-02', null],
]
psql(`BEGIN;
${demo.map(([p, t, d, u], i) => `INSERT INTO "MediaItem"(id, publisher, title, date, image, url, "isPublished", "sortOrder", "updatedAt")
  VALUES ('demo20-${i}', '${p}', '${t}', '${d}', '/images/articles/stat${(i % 4) + 1}.jpg', ${u ? `'${u}'` : 'NULL'}, true, ${4 + i}, now());
INSERT INTO "_MediaItemToPractice"("A","B") VALUES ('demo20-${i}', 'bankrotstvo');`).join('\n')}
COMMIT;`)
console.log('опубликовано публикаций:', psql(`select count(*) from "MediaItem" where "isPublished"`))
console.log(execSync('node D:/IT/VS/project-yuriki/tmp/task12/revalidate-12.4.mjs 3140').toString().trim())
