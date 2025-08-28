"use client"

import { useEffect, useState } from "react"

interface Cube {
  id: number
  size: number
  left: number
  animationDuration: number
  animationDelay: number
  opacity: number
  rotationSpeed: number
}

export function FloatingCubesEnhanced() {
  const [cubes, setCubes] = useState<Cube[]>([])

  useEffect(() => {
    const generateCubes = () => {
      const newCubes: Cube[] = []
      for (let i = 0; i < 12; i++) {
        newCubes.push({
          id: i,
          size: Math.random() * 30 + 15, // 15-45px
          left: Math.random() * 100, // 0-100%
          animationDuration: Math.random() * 25 + 20, // 20-45s
          animationDelay: Math.random() * 15, // 0-15s delay
          opacity: Math.random() * 0.2 + 0.05, // 0.05-0.25 opacity
          rotationSpeed: Math.random() * 2 + 1, // 1-3x rotation speed
        })
      }
      setCubes(newCubes)
    }

    generateCubes()
  }, [])

  return (
    <>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {cubes.map((cube) => (
          <div
            key={cube.id}
            className="absolute"
            style={{
              left: `${cube.left}%`,
              bottom: "-60px",
              animation: `floatUp ${cube.animationDuration}s linear infinite`,
              animationDelay: `${cube.animationDelay}s`,
            }}
          >
            <div
              className="relative"
              style={{
                width: `${cube.size}px`,
                height: `${cube.size}px`,
                animation: `rotate3d ${cube.animationDuration / cube.rotationSpeed}s linear infinite`,
                opacity: cube.opacity,
              }}
            >
              {/* Simple wireframe cube using borders */}
              <div
                className="border-2 border-gray-400 absolute"
                style={{
                  width: `${cube.size}px`,
                  height: `${cube.size}px`,
                }}
              />
              <div
                className="border-2 border-gray-400 absolute"
                style={{
                  width: `${cube.size}px`,
                  height: `${cube.size}px`,
                  transform: `translate(${cube.size * 0.3}px, -${cube.size * 0.3}px)`,
                }}
              />
              {/* Connecting lines */}
              <div
                className="absolute bg-gray-400"
                style={{
                  width: "2px",
                  height: `${cube.size * 0.42}px`,
                  transform: `rotate(45deg)`,
                  top: "0px",
                  left: "0px",
                }}
              />
              <div
                className="absolute bg-gray-400"
                style={{
                  width: "2px",
                  height: `${cube.size * 0.42}px`,
                  transform: `rotate(45deg)`,
                  top: "0px",
                  right: "0px",
                }}
              />
              <div
                className="absolute bg-gray-400"
                style={{
                  width: "2px",
                  height: `${cube.size * 0.42}px`,
                  transform: `rotate(45deg)`,
                  bottom: "0px",
                  left: "0px",
                }}
              />
              <div
                className="absolute bg-gray-400"
                style={{
                  width: "2px",
                  height: `${cube.size * 0.42}px`,
                  transform: `rotate(45deg)`,
                  bottom: "0px",
                  right: "0px",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-100vh);
          }
        }
        
        @keyframes rotate3d {
          0% {
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          100% {
            transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg);
          }
        }
      `}</style>
    </>
  )
}
