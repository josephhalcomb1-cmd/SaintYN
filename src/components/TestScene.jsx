import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Test scene for threejs-devtools-mcp. Remove this file and its <TestScene />
// line in App.jsx when it's no longer needed.
export default function TestScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.name = 'TestScene'
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.name = 'Camera'
    camera.position.set(0, 0, 6)

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1, 0.32, 160, 24),
      new THREE.MeshStandardMaterial({ color: '#c2a165', metalness: 0.6, roughness: 0.35 }),
    )
    knot.name = 'GoldKnot'
    knot.material.name = 'Gold'
    scene.add(knot)

    const ambient = new THREE.AmbientLight('#ffffff', 0.4)
    ambient.name = 'Ambient'
    const key = new THREE.DirectionalLight('#ffffff', 2)
    key.name = 'KeyLight'
    key.position.set(3, 4, 5)
    scene.add(ambient, key)

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(mount)

    renderer.setAnimationLoop((t) => {
      knot.rotation.x = t * 0.0003
      knot.rotation.y = t * 0.0005
      renderer.render(scene, camera)
    })

    return () => {
      renderer.setAnimationLoop(null)
      ro.disconnect()
      knot.geometry.dispose()
      knot.material.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return <section className="test-scene" ref={mountRef} aria-hidden="true" />
}
