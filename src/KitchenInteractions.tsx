import { useEffect, useRef, useState } from 'react'
import {
  artworkHeight, artworkWidth, drawSink, drawUtensils,
  loadKitchenLayers, sinkDuration, utensilDuration, type KitchenLayers,
} from './kitchen-effects'
import { KitchenSound } from './kitchen-sound'
import { MiddleOven } from './MiddleOven'

type Effect = 'sink' | 'utensils'
type Playing = Record<Effect, boolean>
const idle: Playing = { sink: false, utensils: false }

type Session = {
  started: number
  reduced: boolean
}

export function KitchenInteractions({ muted }: { muted: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const frame = useRef(0)
  const sessions = useRef<Partial<Record<Effect, Session>>>({})
  const sound = useRef<KitchenSound | null>(null)
  const [layers, setLayers] = useState<KitchenLayers>()
  const [playing, setPlaying] = useState<Playing>(idle)

  useEffect(() => {
    let active = true
    void loadKitchenLayers().then(assets => { if (active) setLayers(assets) }).catch(() => {})
    return () => {
      active = false
      cancelAnimationFrame(frame.current)
      sessions.current = {}
      sound.current?.dispose()
    }
  }, [])

  useEffect(() => { sound.current?.setMuted(muted) }, [muted])

  function animate(now: number) {
    const context = canvas.current?.getContext('2d')
    if (!context || !layers) return
    context.clearRect(0, 0, artworkWidth, artworkHeight)
    const { sink, utensils } = sessions.current
    if (sink) {
      const elapsed = now - sink.started
      if (elapsed < (sink.reduced ? 700 : sinkDuration)) {
        drawSink(context, layers, sink.reduced ? 1000 : elapsed)
      } else {
        delete sessions.current.sink
        sound.current?.stop('sink')
        setPlaying(current => ({ ...current, sink: false }))
      }
    }
    if (utensils) {
      const elapsed = now - utensils.started
      if (elapsed < (utensils.reduced ? 530 : utensilDuration)) {
        if (!utensils.reduced) drawUtensils(context, layers, elapsed)
      } else {
        delete sessions.current.utensils
        sound.current?.stop('utensils')
        setPlaying(current => ({ ...current, utensils: false }))
      }
    }
    frame.current = sessions.current.sink || sessions.current.utensils ? requestAnimationFrame(animate) : 0
  }

  function start(effect: Effect) {
    if (!layers || sessions.current[effect]) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!muted) {
      sound.current ??= new KitchenSound()
      sound.current.play(effect)
    }
    sessions.current[effect] = { started: performance.now(), reduced }
    setPlaying(current => ({ ...current, [effect]: true }))
    if (!frame.current) frame.current = requestAnimationFrame(animate)
  }

  return <>
    <MiddleOven />
    <canvas className="kitchen-effects" ref={canvas} width={artworkWidth} height={artworkHeight} aria-hidden="true" />
    <button type="button" className="kitchen-object kitchen-utensils" aria-label="Swing the hanging ladle and whisk"
      disabled={!layers} aria-disabled={playing.utensils} onClick={() => start('utensils')} />
    <button type="button" className="kitchen-object kitchen-sink" aria-label="Turn on the kitchen sink"
      disabled={!layers} aria-disabled={playing.sink} onClick={() => start('sink')} />
    <span className="sr-only" role="status">
      {playing.sink && 'Sink running. '}{playing.utensils && 'Ladle and whisk clink.'}
    </span>
  </>
}


