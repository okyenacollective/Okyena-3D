"use client"

import { useEffect, useState } from "react"

interface Cube {
  id: number
  size: number
  left: number
  animationDuration: number
  animationDelay: number
  opacity: number
}

export function FloatingCubes() {
  const [cubes, setCubes] = useState<Cube[]>([])

  useEffect(() => {
    // Generate random cubes
    const generateCubes = () => {
      const newCubes: Cube[] = []
      for (let i = 0; i < 15; i++) {
        newCubes.push({
          id: i,
          size: Math.random() * 40 + 20, // 20-60px
          left: Math.random() * 100, // 0-100%
          animationDuration: Math.random() * 20 + 15, // 15-35s
          animationDelay: Math.random() * 10, // 0-10s delay
          opacity: Math.random() * 0.3 + 0.1, // 0.1-0.4 opacity
        })
      }
      setCubes(newCubes)
    }

    generateCubes()
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {cubes.map((cube) => (
        <div
          key={cube.id}
          className="absolute animate-float"
          style={{
            left: `${cube.left}%`,
            width: `${cube.size}px`,
            height: `${cube.size}px`,
            animationDuration: `${cube.animationDuration}s`,
            animationDelay: `${cube.animationDelay}s`,
            opacity: cube.opacity,
          }}
        >
          {/* Wireframe Cube using CSS borders */}
          <div className="relative w-full h-full">
            {/* Front face */}
            <div
              className="absolute border-2 border-black"
              style={{
                width: `${cube.size}px`,
                height: `${cube.size}px`,
                transform: `translateZ(${cube.size / 2}px)`,
              }}
            />
            {/* Back face */}
            <div
              className="absolute border-2 border-black"
              style={{
                width: `${cube.size}px`,
                height: `${cube.size}px`,
                transform: `translateZ(-${cube.size / 2}px)`,
              }}
            />
            {/* Top face */}
            <div
              className="absolute border-2 border-black"
              style={{
                width: `${cube.size}px`,
                height: `${cube.size}px`,
                transform: `rotateX(90deg) translateZ(${cube.size / 2}px)`,
              }}
            />
            {/* Bottom face */}
            <div
              className="absolute border-2 border-black"
              style={{
                width: `${cube.size}px`,
                height: `${cube.size}px`,
                transform: `rotateX(90deg) translateZ(-${cube.size / 2}px)`,
              }}
            />
            {/* Left face */}
            <div
              className="absolute border-2 border-black"
              style={{
                width: `${cube.size}px`,
                height: `${cube.size}px`,
                transform: `rotateY(90deg) translateZ(${cube.size / 2}px)`,
              }}
            />
            {/* Right face */}
            <div
              className="absolute border-2 border-black"
              style={{
                width: `${cube.size}px`,
                height: `${cube.size}px`,
                transform: `rotateY(90deg) translateZ(-${cube.size / 2}px)`,
              }}
            />
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          100% {
            transform: translateY(-100px) rotateX(360deg) rotateY(360deg) rotateZ(360deg);
          }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  )
}
