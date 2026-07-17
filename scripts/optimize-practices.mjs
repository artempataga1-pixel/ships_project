import sharp from 'sharp'
import path from 'node:path'
import fs from 'node:fs/promises'

const SRC_DIR = path.resolve(import.meta.dirname, '../public/reference3')
const ARCHIVE_DIR = 'C:\\Users\\Admin\\Documents\\yuriki-media-originals'

const files = ['practice-1.png', 'practice-2.png', 'practice-3.png', 'practice-4.png', 'practice-5.png', 'practice-6.png']

for (const file of files) {
  const srcPath = path.join(SRC_DIR, file)
  const webpName = file.replace(/\.png$/, '.webp')
  const webpPath = path.join(SRC_DIR, webpName)

  await sharp(srcPath)
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(webpPath)

  await fs.copyFile(srcPath, path.join(ARCHIVE_DIR, file))
  await fs.rm(srcPath)

  console.log(`${file} → ${webpName}`)
}
