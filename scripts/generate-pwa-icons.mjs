import { mkdir, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '../public')
const iconsDir = join(publicDir, 'icons')

const sizes = [16, 32, 48, 64, 72, 96, 128, 144, 152, 180, 192, 384, 512]

async function pngFromSvg(svgPath, size, outPath) {
  await sharp(svgPath).resize(size, size).png().toFile(outPath)
}

async function main() {
  await mkdir(iconsDir, { recursive: true })

  const iconSvg = join(publicDir, 'icon.svg')
  const maskableSvg = join(publicDir, 'icon-maskable.svg')

  for (const size of sizes) {
    await pngFromSvg(iconSvg, size, join(iconsDir, `icon-${size}x${size}.png`))
    console.log(`icon-${size}x${size}.png`)
  }

  await pngFromSvg(iconSvg, 180, join(publicDir, 'apple-touch-icon.png'))
  await pngFromSvg(iconSvg, 32, join(publicDir, 'favicon-32x32.png'))
  await pngFromSvg(iconSvg, 16, join(publicDir, 'favicon-16x16.png'))
  await pngFromSvg(maskableSvg, 512, join(iconsDir, 'icon-maskable-512x512.png'))

  console.log('apple-touch-icon.png, favicons, maskable — done')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
