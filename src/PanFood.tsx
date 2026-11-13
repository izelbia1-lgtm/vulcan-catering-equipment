import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './pan-food.css'

// Coordinates are in the 362 × 362 chef sprite. Each path stops inside the
// silver lip so the original front rim stays visible in front of the food.
const restingLip = 'M212 309 C222 301 278 301 294 309 C287 317 227 317 212 309 Z'
const graspedLip = 'M212 312 C227 304 278 304 294 312 C283 319 227 319 212 312 Z'
const liftedLip = 'M204 289 C207 279 234 270 255 271 C269 271 282 276 283 283 C282 292 268 300 247 303 C228 307 209 304 204 298 C202 295 202 292 204 289 Z'
const amusedLip = 'M212 308 C220 299 279 298 294 308 C285 318 226 319 212 308 Z'

function panPose(index: number) {
  if (index === 6) return { lip: liftedLip, x: 241, y: 287, width: 78, height: 28, angle: -.13 }
  if (index === 11) return { lip: amusedLip, x: 253, y: 309, width: 80, height: 17, angle: 0 }
  if (index >= 4) return { lip: graspedLip, x: 253, y: 311, width: 80, height: 14, angle: 0 }
  return { lip: restingLip, x: 253, y: 309, width: 80, height: 15, angle: 0 }
}

export function PanFood({ index }: { index: number }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [food, setFood] = useState<HTMLImageElement>()
  const pose = panPose(index)

  useEffect(() => {
    let active = true
    const image = new Image()
    image.src = `${import.meta.env.BASE_URL}artwork/pan-sauté.webp`
    void image.decode().then(() => { if (active) setFood(image) }).catch(() => {})
    return () => { active = false }
  }, [])

  useLayoutEffect(() => {
    const context = canvas.current?.getContext('2d')
    if (!context) return
    context.clearRect(0, 0, 362, 362)
    if (!food || (index >= 8 && index <= 10)) return

    const { lip, x, y, width, height, angle } = panPose(index)
    const mask = new Path2D(lip)
    function draw(shiftX = 0, shiftY = 0) {
      if (!context || !food) return
      context.clearRect(0, 0, 362, 362)
      context.save()
      context.clip(mask)
      context.translate(x + shiftX, y + shiftY)
      context.rotate(angle)
      context.drawImage(food, -width / 2, -height / 2, width, height)
      context.restore()
    }

    if (index !== 6 || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      draw()
      return
    }

    const start = performance.now()
    let frame = 0
    function settle(now: number) {
      const progress = Math.min(1, Math.max(0, (now - start) / 250))
      const rebound = Math.sin(progress * Math.PI * 1.4) * (1 - progress)
      draw(-2.4 * rebound, -2.2 * rebound)
      if (progress < 1) frame = requestAnimationFrame(settle)
    }
    draw()
    frame = requestAnimationFrame(settle)
    return () => cancelAnimationFrame(frame)
  }, [food, index])

  return <>
    <canvas ref={canvas} className="chef pan-food" width={362} height={362} aria-hidden="true" data-pose={index + 1} />
    {food && (index < 8 || index === 11) && <div className="chef pan-vapor" aria-hidden="true">
      <div className="pan-vapor-origin" style={{ left: `${pose.x / 362 * 100}%`, top: `${(pose.y - 5) / 362 * 100}%` }}>
        <i /><i />
      </div>
    </div>}
  </>
}
