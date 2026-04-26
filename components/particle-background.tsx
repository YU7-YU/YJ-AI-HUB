"use client"

import { useEffect, useRef, useCallback } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
}

const DESKTOP_COUNT = 60
const MOBILE_COUNT = 20
const MOBILE_BREAKPOINT = 768
const MAX_SPEED = 0.4

function getParticleColor(): string {
  const computed = getComputedStyle(document.documentElement)
  return computed.getPropertyValue("--color-primary").trim() || "hsl(220, 90%, 60%)"
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT
    const count = isMobile ? MOBILE_COUNT : DESKTOP_COUNT
    const color = getParticleColor()

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * MAX_SPEED,
        vy: (Math.random() - 0.5) * MAX_SPEED,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.3,
      })
    }

    let frameId: number

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (prefersReducedMotion) {
        // Static gradient fallback
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.6
        )
        gradient.addColorStop(0, `${color.replace("hsl(", "hsla(").replace(")", ", 0.08)")}`)
        gradient.addColorStop(1, "transparent")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        return
      }

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `${color.replace("hsl(", "hsla(").replace(")", `, ${p.opacity})`)}`
        ctx.fill()
      }

      frameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    window.addEventListener("resize", resize)
    const cleanup = animate()

    return () => {
      window.removeEventListener("resize", resize)
      cleanup()
    }
  }, [animate])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  )
}
