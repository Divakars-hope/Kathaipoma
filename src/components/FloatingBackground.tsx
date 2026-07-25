import { useMemo } from 'react'

/**
 * Ambient, non-distracting ♀ symbols that drift upward and fade.
 * Pure CSS animation (no JS ticking) so it stays cheap on low-end rural devices.
 * Respects prefers-reduced-motion via the global rule in index.css.
 */
export default function FloatingBackground() {
  const symbols = useMemo(() => {
    const count = 14
    return Array.from({ length: count }, (_, i) => {
      const left = Math.round((i / count) * 100 + (Math.random() * 6 - 3))
      const size = 18 + Math.round(Math.random() * 34) // 18–52px
      const duration = 14 + Math.random() * 14 // 14–28s
      const delay = Math.random() * 20
      const opacityMax = 0.15 + Math.random() * 0.2
      return { id: i, left, size, duration, delay, opacityMax }
    })
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {symbols.map((s) => (
        <span
          key={s.id}
          className="absolute bottom-0 select-none font-display text-blossom-300 animate-floatUp"
          style={{
            left: `${s.left}%`,
            fontSize: `${s.size}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            opacity: 0,
            // @ts-expect-error custom property read by the keyframes via opacity max isn't native,
            // so we approximate with the animation itself; this var is just documentation.
            '--max-opacity': s.opacityMax
          }}
        >
          ♀
        </span>
      ))}
    </div>
  )
}
