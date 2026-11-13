export const artworkWidth = 1774
export const artworkHeight = 887
export const sinkDuration = 3650
export const utensilDuration = 1740
export const clinkTime = 310

const parts = {
  ladle: { left: 754, top: 409, pivot: [771, 409] },
  whisk: { left: 789, top: 401, pivot: [810, 403] },
  handle: { left: 1434, top: 578, pivot: [1435, 583] },
}

type Part = keyof typeof parts
type Layer = { patch: HTMLImageElement; object: HTMLImageElement }
export type KitchenLayers = Record<Part, Layer>

function loadImage(name: string) {
  const image = new Image()
  image.src = `${import.meta.env.BASE_URL}artwork/${name}.png`
  return image.decode().then(() => image)
}

export async function loadKitchenLayers(): Promise<KitchenLayers> {
  const [ladle, whisk, handle] = await Promise.all(
    (['ladle', 'whisk', 'handle'] as const).map(async name => {
      const [patch, object] = await Promise.all([loadImage(name + '-patch'), loadImage(name + '-object')])
      return { patch, object }
    }),
  )
  return { ladle, whisk, handle }
}

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const smooth = (value: number) => {
  const t = clamp(value)
  return t * t * (3 - 2 * t)
}

function paintPatch(context: CanvasRenderingContext2D, name: Part, layer: Layer) {
  context.drawImage(layer.patch, parts[name].left, parts[name].top)
}

function paintObject(context: CanvasRenderingContext2D, name: Part, layer: Layer, angle: number) {
  const { left, top, pivot: [x, y] } = parts[name]
  context.save()
  context.translate(x, y)
  context.rotate(angle)
  context.drawImage(layer.object, left - x, top - y)
  context.restore()
}

export function drawUtensils(context: CanvasRenderingContext2D, layers: KitchenLayers, elapsed: number) {
  const t = (elapsed - clinkTime) / 1000
  const angle = elapsed < clinkTime
    ? .158 * Math.sin(Math.PI * elapsed / (2 * clinkTime))
    : .158 * Math.exp(-3.25 * t) * Math.cos(14 * t) * (1 - smooth((elapsed - 1470) / 270))
  paintPatch(context, 'ladle', layers.ladle)
  paintPatch(context, 'whisk', layers.whisk)
  paintObject(context, 'ladle', layers.ladle, -angle * (angle < 0 ? .63 : 1))
  paintObject(context, 'whisk', layers.whisk, angle * .87)
}

export const bubbles = [
  { start: 650, life: 870, x: 5, rise: 50, size: 4.8 },
  { start: 915, life: 1050, x: 15, rise: 71, size: 6.1 },
  { start: 1330, life: 1030, x: -12, rise: 62, size: 4.4 },
  { start: 1710, life: 1020, x: 25, rise: 74, size: 5.2 },
  { start: 2140, life: 810, x: 9, rise: 58, size: 3.9 },
]

const spoutX = 1466
const spoutY = 541
const basinY = 597

function line(context: CanvasRenderingContext2D, x: number, y: number, endX: number, endY: number) {
  context.beginPath()
  context.moveTo(x, y)
  context.lineTo(endX, endY)
  context.stroke()
}

function drawFlow(context: CanvasRenderingContext2D, elapsed: number) {
  const amount = smooth((elapsed - 175) / 270) * (1 - smooth((elapsed - 2470) / 520))
  if (amount <= 0) return
  const length = basinY - spoutY
  const endY = spoutY + length * smooth((elapsed - 175) / 260)
  context.save()
  context.lineCap = 'round'
  const stream = context.createLinearGradient(spoutX - 2, 0, spoutX + 2, 0)
  stream.addColorStop(0, '#92d8f1aa')
  stream.addColorStop(.5, '#fbffffeb')
  stream.addColorStop(1, '#8ac3e3a1')
  context.strokeStyle = stream
  context.globalAlpha = amount
  context.lineWidth = 3.6 * amount
  context.beginPath()
  context.moveTo(spoutX, spoutY)
  context.quadraticCurveTo(spoutX + Math.sin(elapsed / 48) * .9, (endY + spoutY) / 2, spoutX + .6, endY)
  context.stroke()
  context.strokeStyle = '#f6ffffbc'
  context.lineWidth = 1.1
  for (let i = 0; i < 7; i++) {
    const cycle = (elapsed / 510 + i * .143) % 1
    const y = spoutY + length * cycle
    if (y < endY - 3) line(context, spoutX + Math.sin(i) * .72, y, spoutX + Math.sin(i) * .72, y + 3.3)
  }
  if (endY >= basinY - 1) {
    for (let i = 0; i < 8; i++) {
      const cycle = (elapsed / 370 + i * .16) % 1
      const x = spoutX + Math.cos(i * 2.4) * (3 + cycle * 12)
      const y = basinY - Math.sin(cycle * Math.PI) * (4 + i % 3 * 2)
      context.globalAlpha = amount * (1 - cycle)
      line(context, x, y, x + Math.cos(i) * 2, y - 1.8)
    }
  }
  context.restore()
}

function drawRipples(context: CanvasRenderingContext2D, elapsed: number) {
  context.save()
  context.strokeStyle = '#dbf6ff'
  context.lineWidth = .8
  for (let i = 0; i < 10; i++) {
    const age = (elapsed - (425 + i * 255)) / 820
    if (age < 0 || age >= 1) continue
    context.globalAlpha = Math.sin(Math.PI * age) * .52
    context.beginPath()
    context.ellipse(spoutX + 5, basinY + .2, 4 + age * 25, .65 + age * 2.05, 0, 0, Math.PI * 2)
    context.stroke()
  }
  context.restore()
}

function drawBubbles(context: CanvasRenderingContext2D, elapsed: number) {
  for (const bubble of bubbles) {
    const t = (elapsed - bubble.start) / bubble.life
    if (t < 0 || t > 1.15) continue
    const x = spoutX + bubble.x * Math.min(1, t * 2) + Math.sin(t * 7) * 3
    const y = basinY - bubble.rise * Math.min(1, t)
    const radius = bubble.size * (.55 + smooth(t * 3) * .45)
    context.save()
    if (t < 1) {
      context.globalAlpha = smooth(t * 6) * .9
      const surface = context.createRadialGradient(x - radius * .26, y - radius * .3, .5, x, y, radius)
      surface.addColorStop(0, '#ffffffa0')
      surface.addColorStop(.42, '#f4ffff29')
      surface.addColorStop(.78, '#6daecc26')
      surface.addColorStop(1, '#c5effcc4')
      context.fillStyle = surface
      context.strokeStyle = '#e0f8ffb8'
      context.lineWidth = .65
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
      context.stroke()
      context.strokeStyle = '#fffdfa'
      context.beginPath()
      context.arc(x, y, radius * .64, Math.PI * 1.12, Math.PI * 1.53)
      context.stroke()
    } else {
      const burst = (t - 1) / .15
      context.globalAlpha = (1 - burst) * .86
      context.strokeStyle = '#e1faff'
      context.lineWidth = .7
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * .4
        const distance = radius + burst * 5
        line(context, x + Math.cos(a) * distance, y + Math.sin(a) * distance,
          x + Math.cos(a) * (distance + 1.8), y + Math.sin(a) * (distance + 1.8))
      }
    }
    context.restore()
  }
}

export function drawSink(context: CanvasRenderingContext2D, layers: KitchenLayers, elapsed: number) {
  const handle = smooth(elapsed / 230) * (1 - smooth((elapsed - 2650) / 420))
  if (handle > .02) {
    paintPatch(context, 'handle', layers.handle)
    paintObject(context, 'handle', layers.handle, -handle * .26)
  }
  drawRipples(context, elapsed)
  drawFlow(context, elapsed)
  drawBubbles(context, elapsed)

  const drop = (elapsed - 3100) / 365
  if (drop < 0 || drop > 1.45) return
  context.save()
  context.globalAlpha = drop < 1 ? .95 : clamp(1 - (drop - 1) * 2.3)
  context.fillStyle = '#e8fbff'
  context.strokeStyle = '#e0f6ff'
  context.lineWidth = .7
  context.beginPath()
  if (drop < 1) {
    context.ellipse(spoutX, spoutY + (basinY - spoutY) * drop ** 2, 1.55, 2.65, 0, 0, Math.PI * 2)
    context.fill()
  } else {
    context.ellipse(spoutX, basinY, (drop - 1) * 28 + 2, 1.2, 0, 0, Math.PI * 2)
    context.stroke()
  }
  context.restore()
}

