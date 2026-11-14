import { useEffect, useRef, useState } from 'react'

type InstallPrompt = Event & { prompt(): Promise<unknown> }
type AppleNavigator = Navigator & { standalone?: boolean }

export function InstallApp() {
  const [installed, setInstalled] = useState(() =>
    matchMedia('(display-mode: standalone)').matches || Boolean((navigator as AppleNavigator).standalone))
  const prompt = useRef<InstallPrompt | null>(null)
  const instructions = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const ready = (event: Event) => {
      event.preventDefault()
      prompt.current = event as InstallPrompt
    }
    const complete = () => {
      prompt.current = null
      instructions.current?.close()
      setInstalled(true)
    }
    window.addEventListener('beforeinstallprompt', ready)
    window.addEventListener('appinstalled', complete)
    return () => {
      window.removeEventListener('beforeinstallprompt', ready)
      window.removeEventListener('appinstalled', complete)
    }
  }, [])

  if (installed) return null

  return <>
    <button type="button" className="quote" onClick={async () => {
      const available = prompt.current
      if (available) {
        prompt.current = null
        try {
          await available.prompt()
          return
        } catch { /* The browser menu remains available. */ }
      }
      instructions.current?.showModal()
    }}>Install app</button>
    <dialog ref={instructions} aria-label="Install Vulcan">
      <div className="dialog-head"><h2>Install Vulcan</h2><form method="dialog">
        <button type="submit" aria-label="Close">×</button>
      </form></div>
      <p><strong>Android:</strong> Open the browser menu and choose Install app or Add to Home screen.</p>
      <p><strong>iPhone or iPad:</strong> Open this page in Safari, tap Share, then Add to Home Screen.</p>
      <p><strong>Desktop:</strong> Use the install icon in the address bar or the browser’s Apps menu.</p>
    </dialog>
  </>
}
