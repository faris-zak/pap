export function playChime() {
  try {
    const context = new AudioContext(); const start = context.currentTime
    ;[523, 659].forEach((frequency, index) => { const oscillator = context.createOscillator(); const gain = context.createGain(); const at = start + index * .25; oscillator.type = 'sine'; oscillator.frequency.value = frequency; gain.gain.setValueAtTime(.001, at); gain.gain.linearRampToValueAtTime(.08, at + .025); gain.gain.exponentialRampToValueAtTime(.001, at + .23); oscillator.connect(gain).connect(context.destination); oscillator.start(at); oscillator.stop(at + .25) })
    window.setTimeout(() => context.close(), 650)
  } catch { /* Audio is optional. */ }
}
