import { useEffect, useState } from 'react'

const frameNames = Array.from({ length: 12 }, (_, i) => `frame-${String(i + 1).padStart(2, '0')}.png`)
const cooking = [[0, 550], [1, 260], [2, 240], [3, 290], [4, 410], [5, 260], [6, 320], [7, 530], [6, 270], [2, 260]] as const
const fire = [[8, 370], [9, 730], [10, 950], [11, 1100]] as const
const motionQuery = '(prefers-reduced-motion: reduce)'

function decode(url: string) {
  const image = new Image()
  image.src = url
  return image.decode().then(() => image)
}

export function useKitchenAnimation() {
  const [artwork, setArtwork] = useState<{ kitchen?: HTMLImageElement; frames?: HTMLImageElement[] }>({})
  const [reduced, setReduced] = useState(() => matchMedia(motionQuery).matches)
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const query = matchMedia(motionQuery)
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    let active = true
    const base = `${import.meta.env.BASE_URL}artwork/`
    // The manifest is supplied only after the original artwork has been prepared.
    fetch(`${base}manifest.json`)
      .then(async response => {
        if (!response.ok || !(response.headers.get('content-type') ?? '').includes('json')) return
        const manifest = await response.json()
        if (manifest.ready !== true) return
        const [kitchen, frames] = await Promise.allSettled([
          decode(`${base}kitchen-wide.webp`),
          Promise.all(frameNames.map(name => decode(base + name))),
        ])
        if (!active || kitchen.status !== 'fulfilled') return
        const images = frames.status === 'fulfilled' ? frames.value : undefined
        const aligned = images?.every(image =>
          image.naturalWidth === images[0].naturalWidth && image.naturalHeight === images[0].naturalHeight,
        )
        setArtwork({ kitchen: kitchen.value, frames: aligned ? images : undefined })
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!artwork.frames || (reduced && !playing)) return
    const sequence = playing ? fire : cooking
    const timer = window.setTimeout(() => {
      if (playing && (reduced || step === fire.length - 1)) {
        setPlaying(false)
        setStep(0)
      } else {
        setStep((step + 1) % sequence.length)
      }
    }, reduced ? 2400 : sequence[step][1])
    return () => window.clearTimeout(timer)
  }, [artwork.frames, playing, reduced, step])

  function triggerFire() {
    if (!artwork.frames || playing) return
    setStep(0)
    setPlaying(true)
  }

  const frameIndex = playing ? (reduced ? 10 : fire[step][0]) : (reduced ? 0 : cooking[step][0])
  return { ...artwork, frameIndex, playing, speech: playing && (reduced || step >= 1), triggerFire }
}


