type Effect = 'sink' | 'utensils'
const clips: Record<Effect, string> = { sink: 'sink-sounds.wav', utensils: 'utensil-clink.wav' }

export class KitchenSound {
  private sounds: Partial<Record<Effect, HTMLAudioElement>> = {}

  play(effect: Effect) {
    const audio = this.sounds[effect] ?? new Audio(`${import.meta.env.BASE_URL}artwork/${clips[effect]}`)
    this.sounds[effect] = audio
    audio.volume = .44
    audio.muted = false
    audio.currentTime = 0
    void audio.play().catch(() => {})
  }

  setMuted(muted: boolean) {
    for (const audio of Object.values(this.sounds)) audio.muted = muted
  }

  stop(effect: Effect) {
    const audio = this.sounds[effect]
    if (audio) audio.pause()
  }

  dispose() {
    for (const audio of Object.values(this.sounds)) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
    this.sounds = {}
  }
}
