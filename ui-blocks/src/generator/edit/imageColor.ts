// The main colour of a logo or photo: the most "colourful" part of the picture, not the background.
// The picture is shrunk, its pixels are sorted into hue groups, and the group with the most colour (count x saturation) wins.
// Greys, near-white and near-black pixels only count when there is nothing else (a black-and-white logo gives a neutral colour).

const hex = (r: number, g: number, b: number) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`

export type LogoPalette = { accent: string; /** a second colour that is clearly different, if the picture has one */ alt?: string }

const hueOf = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const d = max - Math.min(r, g, b)
  if (!d) return 0
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return (h * 60 + 360) % 360
}

/** `data` is RGBA like canvas ImageData. Returns undefined for a transparent or empty picture. */
export function dominantColor(data: ArrayLike<number>): string | undefined {
  return paletteFromPixels(data)?.accent
}

/** the main colour of a picture and, when there is one, a clearly different second colour (at least 40 degrees of hue away, a quarter as big) */
export function paletteFromPixels(data: ArrayLike<number>): LogoPalette | undefined {
  const HUES = 24
  const groups = Array.from({ length: HUES }, () => ({ weight: 0, r: 0, g: 0, b: 0, n: 0 }))
  const grey = { r: 0, g: 0, b: 0, n: 0, dark: 0, light: 0 }
  for (let i = 0; i + 3 < data.length; i += 4) {
    const a = data[i + 3]
    if (a < 128) continue
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 510
    const delta = (max - min) / 255
    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1) || 1)
    // near white / near black / grey: background or text of a logo
    if (s < 0.22 || l > 0.93 || l < 0.07) {
      grey.n += 1
      grey.r += r
      grey.g += g
      grey.b += b
      if (l < 0.5) grey.dark += 1
      else grey.light += 1
      continue
    }
    let h: number
    if (max === r) h = ((g - b) / (max - min) + 6) % 6
    else if (max === g) h = (b - r) / (max - min) + 2
    else h = (r - g) / (max - min) + 4
    const group = groups[Math.min(HUES - 1, Math.floor((h / 6) * HUES))]
    group.weight += s * (1 - Math.abs(2 * l - 1) * 0.5)
    group.r += r
    group.g += g
    group.b += b
    group.n += 1
  }
  const total = groups.reduce((sum, g) => sum + g.n, 0) + grey.n
  const ranked = groups.filter((g) => g.n > 0 && g.n >= 0.01 * total).sort((x, y) => y.weight - x.weight)
  if (ranked.length) {
    const colorOf = (g: (typeof groups)[number]) => hex(g.r / g.n, g.g / g.n, g.b / g.n)
    const accent = colorOf(ranked[0])
    const other = ranked.slice(1).find((g) => g.weight >= ranked[0].weight * 0.25 && Math.min(Math.abs(hueOf(colorOf(g)) - hueOf(accent)), 360 - Math.abs(hueOf(colorOf(g)) - hueOf(accent))) >= 40)
    return { accent, alt: other ? colorOf(other) : undefined }
  }
  if (grey.n > 0) return { accent: grey.dark >= grey.light ? '#111827' : '#f9fafb' }
  return undefined
}

/** reads an uploaded picture (png, jpg, webp, svg ...) in the browser */
export async function colorFromFile(file: File): Promise<LogoPalette | undefined> {
  const url = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('could not read the picture'))
      el.src = url
    })
    const size = 96
    const scale = Math.min(1, size / Math.max(image.naturalWidth || size, image.naturalHeight || size))
    const w = Math.max(1, Math.round((image.naturalWidth || size) * scale))
    const h = Math.max(1, Math.round((image.naturalHeight || size) * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return undefined
    context.drawImage(image, 0, 0, w, h)
    return paletteFromPixels(context.getImageData(0, 0, w, h).data)
  } catch {
    return undefined
  } finally {
    URL.revokeObjectURL(url)
  }
}
