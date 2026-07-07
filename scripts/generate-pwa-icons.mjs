import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const ROOT = path.resolve(import.meta.dirname, "..")
const SOURCE_SVG = path.join(ROOT, "public/favicon.svg")
const ICONS_DIR = path.join(ROOT, "public/icons")
const SPLASH_DIR = path.join(ROOT, "public/splash")

const BRAND_BG = { r: 9, g: 9, b: 11, alpha: 1 }

const ICON_SIZES = [72, 96, 128, 144, 152, 167, 180, 192, 384, 512]

const SPLASH_SIZES = [
  { width: 750, height: 1334, name: "apple-splash-750x1334.png" },
  { width: 1170, height: 2532, name: "apple-splash-1170x2532.png" },
  { width: 1284, height: 2778, name: "apple-splash-1284x2778.png" },
  { width: 1290, height: 2796, name: "apple-splash-1290x2796.png" },
  { width: 2048, height: 2732, name: "apple-splash-2048x2732.png" },
]

async function ensureDirs() {
  await fs.mkdir(ICONS_DIR, { recursive: true })
  await fs.mkdir(SPLASH_DIR, { recursive: true })
}

async function renderLogo(size) {
  return sharp(SOURCE_SVG)
    .resize(size, size, {
      fit: "contain",
      background: BRAND_BG,
    })
    .png()
    .toBuffer()
}

async function generateIcons() {
  for (const size of ICON_SIZES) {
    const out = path.join(ICONS_DIR, `icon-${size}x${size}.png`)
    await sharp(SOURCE_SVG)
      .resize(size, size, { fit: "contain", background: BRAND_BG })
      .png()
      .toFile(out)
    console.log(`Generated ${path.relative(ROOT, out)}`)
  }

  const maskableSize = 512
  const logoSize = Math.round(maskableSize * 0.72)
  const logo = await renderLogo(logoSize)
  const maskableOut = path.join(ICONS_DIR, "icon-maskable-512x512.png")
  await sharp({
    create: {
      width: maskableSize,
      height: maskableSize,
      channels: 4,
      background: BRAND_BG,
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(maskableOut)
  console.log(`Generated ${path.relative(ROOT, maskableOut)}`)

  const appleTouch = path.join(ICONS_DIR, "apple-touch-icon.png")
  await fs.copyFile(path.join(ICONS_DIR, "icon-180x180.png"), appleTouch)
  console.log(`Generated ${path.relative(ROOT, appleTouch)}`)
}

async function generateSplashes() {
  for (const { width, height, name } of SPLASH_SIZES) {
    const logoSize = Math.round(Math.min(width, height) * 0.2)
    const logo = await renderLogo(logoSize)
    const out = path.join(SPLASH_DIR, name)
    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: BRAND_BG,
      },
    })
      .composite([{ input: logo, gravity: "center" }])
      .png()
      .toFile(out)
    console.log(`Generated ${path.relative(ROOT, out)}`)
  }
}

await ensureDirs()
await generateIcons()
await generateSplashes()
console.log("PWA icons and splash screens generated.")
