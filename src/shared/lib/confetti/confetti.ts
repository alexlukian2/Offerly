// Святковий вибух конфеті — для моментів, які варто відсвяткувати (офер!).
// Звичайні DOM-елементи з CSS-анімацією: без бібліотек і без canvas. Самі прибираються після анімації
const COLORS = ['#3fd6ff', '#9b7bff', '#ff5fd2', '#ffd24a', '#34d9a0']
const PIECES = 90
const DURATION_MS = 1800

export function launchConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (typeof Element.prototype.animate !== 'function') return // старий браузер або тести (jsdom)

  const layer = document.createElement('div')
  layer.setAttribute('aria-hidden', 'true')
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:400;overflow:hidden'

  for (let i = 0; i < PIECES; i++) {
    const piece = document.createElement('span')
    const size = 6 + Math.random() * 6
    const startX = 50 + (Math.random() - 0.5) * 30 // від центру екрана, трохи вшир
    piece.style.cssText = `position:absolute;top:-12px;left:${startX}%;width:${size}px;height:${size * 1.4}px;border-radius:2px;background:${COLORS[i % COLORS.length]}`
    // Web Animations API: та сама CSS-анімація, але з JS — кожному шматочку своя траєкторія
    piece.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        {
          transform: `translate(${(Math.random() - 0.5) * 900}px, ${window.innerHeight * (0.6 + Math.random() * 0.5)}px) rotate(${(Math.random() - 0.5) * 1080}deg)`,
          opacity: 0,
        },
      ],
      { duration: DURATION_MS * (0.7 + Math.random() * 0.5), easing: 'cubic-bezier(.2,.6,.3,1)', delay: Math.random() * 200, fill: 'forwards' },
    )
    layer.appendChild(piece)
  }

  document.body.appendChild(layer)
  window.setTimeout(() => layer.remove(), DURATION_MS * 1.4)
}
