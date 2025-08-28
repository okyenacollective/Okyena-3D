"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, Stats, Grid } from "@react-three/drei"
import { useEffect, useRef, useState, useCallback } from "react"
import * as THREE from "three"
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader"

interface GSplatViewerProps {
  plyData: ArrayBuffer | null
  pointSize: number
  quality: number
  showStats: boolean
  showGrid: boolean
  environment: string
  autoRotate: boolean
  cameraSpeed: number
  onLoadComplete?: () => void
  onLoadError?: (error: string) => void
  onStatsUpdate?: (stats: { points: number; fps: number; memory: number }) => void
}

// Custom Gaussian Splat Material
const createSplatMaterial = (pointSize: number, quality: number) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      pointSize: { value: pointSize },
      quality: { value: quality },
      time: { value: 0 },
    },
    vertexShader: `
      uniform float pointSize;
      uniform float quality;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vDistance;
      
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vDistance = -mvPosition.z;
        
        // Adaptive point size based on distance and quality
        float adaptiveSize = pointSize * (1.0 + quality * 0.5);
        gl_PointSize = adaptiveSize * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float quality;
      uniform float time;
      varying vec3 vColor;
      varying float vDistance;
      
      void main() {
        // Create circular splat shape
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        // Gaussian falloff for realistic splat appearance
        float alpha = exp(-dist * dist * 8.0);
        
        // Quality-based alpha adjustment
        alpha *= (0.7 + quality * 0.3);
        
        // Distance-based fade for performance
        float distanceFade = 1.0 - smoothstep(50.0, 100.0, vDistance);
        alpha *= distanceFade;
        
        if (alpha < 0.01) discard;
        
        // Enhanced color with slight brightness variation
        vec3 finalColor = vColor * (0.9 + 0.1 * sin(time * 0.001 + vDistance * 0.01));
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  })
}

function GSplatPoints({
  geometry,
  pointSize,
  quality,
  autoRotate,
}: {
  geometry: THREE.BufferGeometry
  pointSize: number
  quality: number
  autoRotate: boolean
}) {
  const meshRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>()

  useFrame((state) => {
    if (meshRef.current && materialRef.current) {
      // Update time uniform for animations
      materialRef.current.uniforms.time.value = state.clock.elapsedTime * 1000

      // Auto rotation
      if (autoRotate) {
        meshRef.current.rotation.y += 0.002
      }
    }
  })

  useEffect(() => {
    if (meshRef.current) {
      materialRef.current = createSplatMaterial(pointSize, quality)
      meshRef.current.material = materialRef.current
    }
  }, [pointSize, quality])

  return (
    <points ref={meshRef} geometry={geometry}>
      <primitive object={createSplatMaterial(pointSize, quality)} attach="material" />
    </points>
  )
}

function CameraController({
  cameraSpeed,
  onCameraChange,
}: {
  cameraSpeed: number
  onCameraChange?: (position: THREE.Vector3, target: THREE.Vector3) => void
}) {
  const { camera } = useThree()
  const controlsRef = useRef<any>()

  useFrame(() => {
    if (controlsRef.current && onCameraChange) {
      onCameraChange(camera.position, controlsRef.current.target)
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      dampingFactor={0.05 * cameraSpeed}
      enableDamping={true}
      minDistance={0.1}
      maxDistance={50}
      autoRotate={false}
      autoRotateSpeed={0.5}
      target={[0, 0, 0]}
      maxPolarAngle={Math.PI}
      minPolarAngle={0}
      zoomSpeed={cameraSpeed}
      rotateSpeed={cameraSpeed}
      panSpeed={cameraSpeed}
    />
  )
}

function PerformanceMonitor({
  onStatsUpdate,
}: {
  onStatsUpdate?: (stats: { points: number; fps: number; memory: number }) => void
}) {
  const { gl, scene } = useThree()

  useFrame(() => {
    if (onStatsUpdate) {
      const info = gl.info
      let pointCount = 0

      scene.traverse((object) => {
        if (object instanceof THREE.Points) {
          const geometry = object.geometry
          if (geometry.attributes.position) {
            pointCount += geometry.attributes.position.count
          }
        }
      })

      onStatsUpdate({
        points: pointCount,
        fps: Math.round((1 / (performance.now() - (window as any).lastFrameTime || 16)) * 1000) || 60,
        memory: (performance as any).memory?.usedJSHeapSize || 0,
      })
      ;(window as any).lastFrameTime = performance.now()
    }
  })

  return null
}

export function GSplatViewer({
  plyData,
  pointSize,
  quality = 1.0,
  showStats = false,
  showGrid = true,
  environment = "studio",
  autoRotate = false,
  cameraSpeed = 1.0,
  onLoadComplete,
  onLoadError,
  onStatsUpdate,
}: GSplatViewerProps) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pointCount, setPointCount] = useState(0)

  const processGeometry = useCallback((geo: THREE.BufferGeometry) => {
    // Enhanced color processing for better visual quality
    const colors = geo.getAttribute("color")
    if (colors) {
      if (colors.itemSize === 3 && colors.array instanceof Uint8Array) {
        const colorArray = new Float32Array(colors.count * 3)
        for (let i = 0; i < colors.count * 3; i++) {
          colorArray[i] = (colors.array as Uint8Array)[i] / 255
        }
        geo.setAttribute("color", new THREE.BufferAttribute(colorArray, 3))
      }
    } else {
      // Generate procedural colors based on position and normals
      const positions = geo.getAttribute("position")
      if (positions) {
        const colorArray = new Float32Array(positions.count * 3)
        const posArray = positions.array as Float32Array

        for (let i = 0; i < positions.count; i++) {
          const i3 = i * 3
          const x = posArray[i3]
          const y = posArray[i3 + 1]
          const z = posArray[i3 + 2]

          // Create colors based on position for better visualization
          const distance = Math.sqrt(x * x + y * y + z * z)
          const hue = (Math.atan2(z, x) + Math.PI) / (2 * Math.PI)
          const saturation = Math.min(distance * 0.5, 1.0)
          const lightness = 0.5 + y * 0.3

          // Convert HSL to RGB
          const c = (1 - Math.abs(2 * lightness - 1)) * saturation
          const x1 = c * (1 - Math.abs(((hue * 6) % 2) - 1))
          const m = lightness - c / 2

          let r, g, b
          if (hue < 1 / 6) {
            r = c
            g = x1
            b = 0
          } else if (hue < 2 / 6) {
            r = x1
            g = c
            b = 0
          } else if (hue < 3 / 6) {
            r = 0
            g = c
            b = x1
          } else if (hue < 4 / 6) {
            r = 0
            g = x1
            b = c
          } else if (hue < 5 / 6) {
            r = x1
            g = 0
            b = c
          } else {
            r = c
            g = 0
            b = x1
          }

          colorArray[i3] = r + m
          colorArray[i3 + 1] = g + m
          colorArray[i3 + 2] = b + m
        }
        geo.setAttribute("color", new THREE.BufferAttribute(colorArray, 3))
      }
    }

    // Compute enhanced normals
    if (!geo.getAttribute("normal")) {
      geo.computeVertexNormals()
    }

    // Center and scale the geometry
    geo.computeBoundingBox()
    if (geo.boundingBox) {
      const center = new THREE.Vector3()
      geo.boundingBox.getCenter(center)
      geo.translate(-center.x, -center.y, -center.z)
    }

    geo.computeBoundingSphere()
    if (geo.boundingSphere) {
      const scale = 3 / geo.boundingSphere.radius
      geo.scale(scale, scale, scale)
    }

    // Apply standard orientation
    geo.rotateX(-Math.PI / 2)

    return geo
  }, [])

  useEffect(() => {
    if (!plyData) {
      setGeometry(null)
      setPointCount(0)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const loader = new PLYLoader()
      let geo = loader.parse(plyData)

      geo = processGeometry(geo)

      const positions = geo.getAttribute("position")
      const count = positions ? positions.count : 0
      setPointCount(count)

      setGeometry(geo)
      setLoading(false)
      onLoadComplete?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load PLY file"
      setError(errorMessage)
      setLoading(false)
      onLoadError?.(errorMessage)
    }
  }, [plyData, processGeometry, onLoadComplete, onLoadError])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-200 border-2 border-black">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="font-mono text-sm tracking-wider uppercase">PROCESSING GAUSSIAN SPLATS...</p>
          <p className="font-mono text-xs mt-2">OPTIMIZING RENDERING PIPELINE</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-200 border-2 border-black">
        <div className="text-center p-6">
          <div className="w-12 h-12 border-2 border-black flex items-center justify-center mx-auto mb-4">
            <span className="font-mono font-bold">!</span>
          </div>
          <p className="font-mono text-sm tracking-wider uppercase mb-2">RENDERING ERROR</p>
          <p className="font-mono text-xs">{error}</p>
        </div>
      </div>
    )
  }

  if (!geometry) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-200 border-2 border-black">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-black flex items-center justify-center mx-auto mb-4">
            <span className="font-mono font-bold text-2xl">3D</span>
          </div>
          <p className="font-mono text-sm tracking-wider uppercase">NO SPLAT DATA LOADED</p>
          <p className="font-mono text-xs mt-2">UPLOAD A PLY FILE TO BEGIN</p>
        </div>
      </div>
    )
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ background: "#f5f5f4" }}
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
        precision: "highp",
        logarithmicDepthBuffer: true,
      }}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
    >
      <color attach="background" args={["#f5f5f4"]} />

      {/* Environment lighting */}
      {environment !== "none" && <Environment preset={environment as any} background={false} intensity={0.4} />}

      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.4} />
      <directionalLight position={[0, 10, 0]} intensity={0.3} />
      <pointLight position={[0, 0, 10]} intensity={0.2} />

      {/* Camera controls */}
      <CameraController
        cameraSpeed={cameraSpeed}
        onCameraChange={(pos, target) => {
          // Camera change callback for future features
        }}
      />

      {/* Main splat rendering */}
      <GSplatPoints geometry={geometry} pointSize={pointSize} quality={quality} autoRotate={autoRotate} />

      {/* Grid helper */}
      {showGrid && (
        <Grid
          args={[20, 20]}
          position={[0, -2, 0]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#888888"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#000000"
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />
      )}

      {/* Performance monitoring */}
      <PerformanceMonitor onStatsUpdate={onStatsUpdate} />

      {/* Stats display */}
      {showStats && <Stats />}

      {/* Fog for depth perception */}
      <fog attach="fog" args={["#f5f5f4", 10, 100]} />
    </Canvas>
  )
}
