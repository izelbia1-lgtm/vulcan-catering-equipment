import { useEffect, useState } from 'react'
import { artworkHeight, artworkWidth } from './kitchen-effects'
import './oven.css'

type OvenPhase = 'closed' | 'opening' | 'open' | 'closing'

const base = `${import.meta.env.BASE_URL}artwork/`
const door = base + 'middle-oven-door.png'
const rolls = base + 'middle-oven-rolls.png'
const position = {
  left: `${57 / artworkWidth * 100}%`,
  top: `${553 / artworkHeight * 100}%`,
  width: `${180 / artworkWidth * 100}%`,
  height: `${48 / artworkHeight * 100}%`,
}

export function MiddleOven() {
  const [phase, setPhase] = useState<OvenPhase>('closed')
  const [ready, setReady] = useState(false)
  const busy = phase === 'opening' || phase === 'closing'
  const open = phase === 'open' || phase === 'opening'

  useEffect(() => {
    let mounted = true
    void Promise.all([door, rolls].map(src => {
      const image = new Image()
      image.src = src
      return image.decode()
    })).then(() => { if (mounted) setReady(true) }).catch(() => {})
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (phase !== 'opening' && phase !== 'closing') return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const next = phase === 'opening' ? 'open' : 'closed'
    const timer = window.setTimeout(() => setPhase(next), reduced ? 0 : phase === 'opening' ? 1110 : 1060)
    return () => window.clearTimeout(timer)
  }, [phase])

  function toggle() {
    setPhase(current => {
      if (current === 'closed') return 'opening'
      if (current === 'open') return 'closing'
      return current
    })
  }

  return <div className="middle-oven" style={position} data-phase={phase}>
    {phase !== 'closed' && <div className="middle-oven-art" aria-hidden="true">
      <div className="oven-cavity">
        <div className="oven-rear" />
        <div className="oven-rack" />
        <div className="oven-light" />
      </div>
      <div className="oven-hinge">
        <div className="oven-door">
          <img className="oven-door-front" src={door} alt="" />
          <div className="oven-door-liner" />
        </div>
      </div>
      <div className="oven-tray"><img src={rolls} alt="" /></div>
      <div className="oven-steam"><i /><i /><i /></div>
      <span className="oven-ready">Ready!</span>
    </div>}
    <button type="button" className="oven-hit" aria-label={open ? 'Close middle oven' : 'Open middle oven'}
      aria-expanded={open} aria-disabled={busy} disabled={!ready} onClick={toggle} />
    <span className="sr-only" role="status">{phase === 'open' && 'The middle oven is open. The rolls are ready.'}</span>
  </div>
}
