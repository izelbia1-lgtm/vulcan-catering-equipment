import { useEffect, useRef, type PointerEvent } from 'react'
import { Link } from 'react-router'
import brands from './equipment-brands.json'
import './brand-train.css'

const pixelsPerSecond = 30
const wrap = (value: number, length: number) => ((value % length) + length) % length

type Logo = { name: string; src: string; href?: string }

export function LogoTrain({ logos }: { logos: Logo[] }) {
  const viewport = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const row = useRef<HTMLUListElement>(null)
  const offset = useRef(0)
  const hovered = useRef(false)
  const focused = useRef(false)
  const drag = useRef<{ id: number; x: number; start: number; moved: boolean } | null>(null)
  const cancelClick = useRef(false)

  function paint() {
    const length = row.current?.getBoundingClientRect().width
    if (!length || !track.current) return
    offset.current = wrap(offset.current, length)
    track.current.style.transform = `translate3d(${-offset.current}px,0,0)`
  }

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const node = viewport.current
    if (!node) return
    let id = 0
    let previous = 0

    function tick(now: number) {
      if (previous && !hovered.current && !focused.current && !drag.current) {
        offset.current += Math.min(now - previous, 50) * pixelsPerSecond / 1000
        paint()
      }
      previous = now
      id = requestAnimationFrame(tick)
    }

    function update() {
      cancelAnimationFrame(id)
      previous = 0
      if (motion.matches) {
        track.current?.style.removeProperty('transform')
        offset.current = 0
      } else id = requestAnimationFrame(tick)
    }

    update()
    motion.addEventListener('change', update)
    return () => {
      motion.removeEventListener('change', update)
      cancelAnimationFrame(id)
    }
  }, [])

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    cancelClick.current = false
    if (event.pointerType !== 'touch' || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    drag.current = { id: event.pointerId, x: event.clientX, start: offset.current, moved: false }
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const gesture = drag.current
    if (!gesture || gesture.id !== event.pointerId) return
    const distance = event.clientX - gesture.x
    if (!gesture.moved && Math.abs(distance) < 6) return
    if (!gesture.moved) event.currentTarget.setPointerCapture(event.pointerId)
    gesture.moved = true
    cancelClick.current = true
    offset.current = gesture.start - distance
    paint()
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id === event.pointerId) drag.current = null
  }

  return (
    <div className="brand-train-viewport" ref={viewport}
      onPointerEnter={event => { if (event.pointerType === 'mouse') hovered.current = true }}
      onPointerLeave={event => { if (event.pointerType === 'mouse') hovered.current = false }}
      onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={event => { if (event.target === event.currentTarget) endDrag(event) }}
      onClickCapture={event => { if (cancelClick.current && event.detail) { event.preventDefault(); cancelClick.current = false } }}
      onFocus={event => {
        if (!event.target.matches(':focus-visible')) return
        focused.current = true
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const cell = event.target.closest<HTMLLIElement>('li')
        if (cell) {
          event.currentTarget.scrollLeft = 0
          offset.current = cell.offsetLeft - (event.currentTarget.clientWidth - cell.offsetWidth) / 2
          offset.current = Math.max(0, Math.min(offset.current, (row.current?.offsetWidth ?? 0) - event.currentTarget.clientWidth))
          paint()
        }
      }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) focused.current = false }}>
      <div className="brand-train-track" ref={track}>
        {[false, true].map(copy => <ul key={String(copy)} ref={copy ? undefined : row} className="brand-train-row"
          data-copy={copy || undefined} aria-hidden={copy || undefined}>
          {logos.map(({ name, src, href }) => {
            const logo = <img src={src} alt={copy ? '' : name} draggable={false} />
            return <li key={name}>{href ? <Link to={href} tabIndex={copy ? -1 : undefined} aria-label={copy ? undefined : `Browse ${name} equipment`}>{logo}</Link> : logo}</li>
          })}
        </ul>)}
      </div>
    </div>
  )
}


const equipmentLogos = brands.map(({ file, ...brand }) => ({
  ...brand,
  src: `${import.meta.env.BASE_URL}brands/${file}`,
}))

export function EquipmentBrandTrain() {
  return <section className="brand-train" aria-labelledby="equipment-brands-title">
    <div className="shell brand-train-heading">
      <h2 id="equipment-brands-title">Our Equipment Brands</h2>
    </div>
    <LogoTrain logos={equipmentLogos} />
  </section>
}