"use client"

import { useEffect, useRef, useState } from "react"

interface SankofaSymbol {
  id: number
  x: number
  y: number
  z: number
  rotationX: number
  rotationY: number
  rotationZ: number
  size: number
  speed: number
  opacity: number
  baseX: number
  baseY: number
  velocityX: number
  velocityY: number
  velocityZ: number
  rotationSpeedX: number
  rotationSpeedY: number
  rotationSpeedZ: number
  floatAmplitudeX: number
  floatAmplitudeY: number
  floatFrequencyX: number
  floatFrequencyY: number
  scrollOffset: number
  bubblePhase: number
}

interface FloatingSankofaProps {
  count?: number
  interactive?: boolean
}

export function FloatingSankofa({ count = 12, interactive = true }: FloatingSankofaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [symbols, setSymbols] = useState<SankofaSymbol[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const animationRef = useRef<number>()
  const timeRef = useRef(0)

  // Initialize Sankofa symbols with bubble-like movement
  useEffect(() => {
    const newSymbols: SankofaSymbol[] = []
    for (let i = 0; i < count; i++) {
      const x = Math.random() * (window.innerWidth + 400) - 200
      const y = Math.random() * (window.innerHeight + 600) + 200 // Start lower for bubble effect
      newSymbols.push({
        id: i,
        x,
        y,
        z: Math.random() * 300 - 150,
        rotationX: Math.random() * 360,
        rotationY: Math.random() * 360,
        rotationZ: Math.random() * 360,
        size: 30 + Math.random() * 50, // Larger for visibility
        speed: 0.2 + Math.random() * 0.5, // Slower for graceful movement
        opacity: 0.1 + Math.random() * 0.3,
        baseX: x,
        baseY: y,
        // Bubble-like upward movement
        velocityX: (Math.random() - 0.5) * 0.3,
        velocityY: -0.5 - Math.random() * 0.8, // Negative for upward movement
        velocityZ: (Math.random() - 0.5) * 0.2,
        // Gentle rotation
        rotationSpeedX: (Math.random() - 0.5) * 0.8,
        rotationSpeedY: (Math.random() - 0.5) * 1.0,
        rotationSpeedZ: (Math.random() - 0.5) * 0.6,
        // Floating properties
        floatAmplitudeX: 15 + Math.random() * 25,
        floatAmplitudeY: 10 + Math.random() * 20,
        floatFrequencyX: 0.3 + Math.random() * 0.8,
        floatFrequencyY: 0.2 + Math.random() * 0.6,
        scrollOffset: Math.random() * 0.3 + 0.1,
        bubblePhase: Math.random() * Math.PI * 2, // Random phase for variety
      })
    }
    setSymbols(newSymbols)
  }, [count])

  // Mouse movement handler
  useEffect(() => {
    if (!interactive) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [interactive])

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Bubble animation loop
  useEffect(() => {
    const animate = () => {
      timeRef.current += 0.016

      setSymbols((prevSymbols) =>
        prevSymbols.map((symbol) => {
          const time = timeRef.current * symbol.speed

          // Bubble-like floating with sine waves
          const waveX1 = Math.sin(time * symbol.floatFrequencyX + symbol.bubblePhase) * symbol.floatAmplitudeX
          const waveX2 = Math.cos(time * symbol.floatFrequencyX * 0.6 + symbol.id) * (symbol.floatAmplitudeX * 0.4)
          const waveY1 = Math.cos(time * symbol.floatFrequencyY + symbol.bubblePhase) * symbol.floatAmplitudeY
          const waveY2 = Math.sin(time * symbol.floatFrequencyY * 0.7 + symbol.id) * (symbol.floatAmplitudeY * 0.3)

          // Upward bubble movement
          const bubbleY = symbol.velocityY * time * 15
          const bubbleX = symbol.velocityX * time * 8
          const bubbleZ = Math.sin(time * 0.4 + symbol.bubblePhase) * 30

          // Calculate new position
          let newX = symbol.baseX + waveX1 + waveX2 + bubbleX
          let newY = symbol.baseY + waveY1 + waveY2 + bubbleY
          const newZ = symbol.z + bubbleZ

          // Scroll following (minimal for bubbles)
          const scrollInfluence = scrollY * symbol.scrollOffset
          newY += scrollInfluence * 0.1

          // Bubble recycling - when they float off screen, reset at bottom
          if (newY < -200 - scrollY) {
            symbol.baseY = window.innerHeight + scrollY + 200 + Math.random() * 400
            symbol.baseX = Math.random() * (window.innerWidth + 400) - 200
            newY = symbol.baseY + waveY1 + waveY2
            newX = symbol.baseX + waveX1 + waveX2
            // Reset bubble phase for variety
            symbol.bubblePhase = Math.random() * Math.PI * 2
          }

          // Horizontal wrapping
          if (newX > window.innerWidth + 200) {
            symbol.baseX = -200
            newX = symbol.baseX + waveX1 + waveX2
          } else if (newX < -200) {
            symbol.baseX = window.innerWidth + 200
            newX = symbol.baseX + waveX1 + waveX2
          }

          // Mouse interaction (gentle repulsion like bubbles)
          if (interactive) {
            const mouseInfluenceX = mousePosition.x - newX
            const mouseInfluenceY = mousePosition.y - newY + scrollY
            const distance = Math.sqrt(mouseInfluenceX * mouseInfluenceX + mouseInfluenceY * mouseInfluenceY)
            const maxDistance = 120

            if (distance < maxDistance && distance > 0) {
              const force = (maxDistance - distance) / maxDistance
              const bubbleForce = force * force * 15 // Gentle repulsion
              const angle = Math.atan2(mouseInfluenceY, mouseInfluenceX)

              // Bubbles move away from cursor
              newX -= Math.cos(angle) * bubbleForce
              newY -= Math.sin(angle) * bubbleForce
            }
          }

          // Gentle rotation like floating objects
          const newRotationX = symbol.rotationX + symbol.rotationSpeedX + Math.sin(time * 0.5) * 0.3
          const newRotationY = symbol.rotationY + symbol.rotationSpeedY + Math.cos(time * 0.4) * 0.4
          const newRotationZ = symbol.rotationZ + symbol.rotationSpeedZ + Math.sin(time * 0.6) * 0.2

          return {
            ...symbol,
            x: newX,
            y: newY,
            z: newZ,
            rotationX: newRotationX,
            rotationY: newRotationY,
            rotationZ: newRotationZ,
          }
        }),
      )

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [mousePosition, interactive, scrollY])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setSymbols((prevSymbols) =>
        prevSymbols.map((symbol) => ({
          ...symbol,
          baseX: Math.random() * (window.innerWidth + 400) - 200,
          baseY: Math.random() * (window.innerHeight + 600) + 200,
        })),
      )
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Sankofa symbol path (simplified wireframe version)
  const createSankofaPath = (size: number) => {
    const scale = size / 100
    return {
      // Bird body (main curve)
      body: `M ${20 * scale} ${50 * scale} Q ${50 * scale} ${20 * scale} ${80 * scale} ${50 * scale}`,
      // Head and beak
      head: `M ${80 * scale} ${50 * scale} L ${90 * scale} ${45 * scale} L ${85 * scale} ${55 * scale} Z`,
      // Tail curve (looking back)
      tail: `M ${20 * scale} ${50 * scale} Q ${10 * scale} ${30 * scale} ${30 * scale} ${35 * scale}`,
      // Legs
      leg1: `M ${40 * scale} ${50 * scale} L ${35 * scale} ${70 * scale}`,
      leg2: `M ${60 * scale} ${50 * scale} L ${65 * scale} ${70 * scale}`,
      // Wing detail
      wing: `M ${45 * scale} ${45 * scale} Q ${55 * scale} ${35 * scale} ${65 * scale} ${45 * scale}`,
      // Eye
      eye: `M ${75 * scale} ${47 * scale} L ${77 * scale} ${47 * scale}`,
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        perspective: "1500px",
        transform: `translateY(${scrollY * -0.05}px)`, // Subtle parallax
      }}
    >
      {symbols.map((symbol) => {
        const paths = createSankofaPath(symbol.size)
        const depth = Math.abs(symbol.z)
        const depthOpacity = symbol.opacity * (1 - depth * 0.002)
        const depthBlur = depth * 0.015

        return (
          <div
            key={symbol.id}
            className="absolute transition-none"
            style={{
              left: `${symbol.x}px`,
              top: `${symbol.y}px`,
              transform: `
                translate(-50%, -50%) 
                translateZ(${symbol.z}px)
                rotateX(${symbol.rotationX}deg) 
                rotateY(${symbol.rotationY}deg) 
                rotateZ(${symbol.rotationZ}deg)
              `,
              transformStyle: "preserve-3d",
              willChange: "transform",
              filter: `blur(${depthBlur}px)`,
            }}
          >
            {/* 3D Wireframe Sankofa Symbol */}
            <div
              className="relative"
              style={{
                width: `${symbol.size}px`,
                height: `${symbol.size}px`,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Front face */}
              <svg
                width={symbol.size}
                height={symbol.size}
                className="absolute"
                style={{
                  transform: `translateZ(${symbol.size * 0.1}px)`,
                  opacity: depthOpacity,
                }}
                viewBox="0 0 100 100"
              >
                <path
                  d={paths.body}
                  fill="none"
                  stroke={`rgba(0, 0, 0, ${depthOpacity})`}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d={paths.head}
                  fill="none"
                  stroke={`rgba(0, 0, 0, ${depthOpacity})`}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d={paths.tail}
                  fill="none"
                  stroke={`rgba(0, 0, 0, ${depthOpacity})`}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d={paths.leg1}
                  fill="none"
                  stroke={`rgba(0, 0, 0, ${depthOpacity})`}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d={paths.leg2}
                  fill="none"
                  stroke={`rgba(0, 0, 0, ${depthOpacity})`}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d={paths.wing}
                  fill="none"
                  stroke={`rgba(0, 0, 0, ${depthOpacity})`}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d={paths.eye}
                  fill="none"
                  stroke={`rgba(0, 0, 0, ${depthOpacity})`}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              {/* Back face (slightly offset) */}
              <svg
                width={symbol.size}
                height={symbol.size}
                className="absolute"
                style={{
                  transform: `translateZ(-${symbol.size * 0.1}px) rotateY(180deg)`,
                  opacity: depthOpacity * 0.6,
                }}
                viewBox="0 0 100 100"
              >
                <path
                  d={paths.body}
                  fill="none"
                  stroke={`rgba(0, 0, 0, ${depthOpacity * 0.6})`}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d={paths.head}
                  fill="none"
                  stroke={`rgba(0, 0, 0, ${depthOpacity * 0.6})`}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d={paths.tail}
                  fill="none"
                  stroke={`rgba(0, 0, 0, ${depthOpacity * 0.6})`}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>

              {/* Connecting lines for 3D effect */}
              <div
                className="absolute"
                style={{
                  width: "2px",
                  height: `${symbol.size * 0.2}px`,
                  backgroundColor: `rgba(0, 0, 0, ${depthOpacity * 0.4})`,
                  left: "20%",
                  top: "50%",
                  transform: "translateY(-50%) rotateY(90deg)",
                  transformOrigin: "center",
                }}
              />
              <div
                className="absolute"
                style={{
                  width: "2px",
                  height: `${symbol.size * 0.2}px`,
                  backgroundColor: `rgba(0, 0, 0, ${depthOpacity * 0.4})`,
                  right: "20%",
                  top: "50%",
                  transform: "translateY(-50%) rotateY(90deg)",
                  transformOrigin: "center",
                }}
              />
              <div
                className="absolute"
                style={{
                  width: "2px",
                  height: `${symbol.size * 0.2}px`,
                  backgroundColor: `rgba(0, 0, 0, ${depthOpacity * 0.4})`,
                  left: "50%",
                  top: "30%",
                  transform: "translateX(-50%) rotateY(90deg)",
                  transformOrigin: "center",
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
