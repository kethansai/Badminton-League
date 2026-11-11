import * as THREE from 'three'

function createFeatherGeometry() {
  const rows = 40
  const columns = 10
  const positions = []
  const coordinates = []
  const indices = []
  for (let row = 0; row <= rows; row += 1) {
    const along = row / rows
    const root = THREE.MathUtils.smoothstep(along, 0, 0.32)
    const cap = along > 0.88 ? Math.sqrt(Math.max(0, 1 - ((along - 0.88) / 0.12) ** 2)) : 1
    const halfWidth = 0.005 + root * cap * 0.21
    for (let column = 0; column <= columns; column += 1) {
      const across = column / columns * 2 - 1
      const crown = 0.035 * (1 - across * across) * halfWidth / 0.215
      positions.push(across * halfWidth + Math.sin(along * Math.PI) * 0.02, 0.65 + along * 2.05, crown + 0.075 * along * along + across * along * 0.012 * halfWidth / 0.215)
      coordinates.push(column / columns, along)
      if (row < rows && column < columns) {
        const current = row * (columns + 1) + column
        indices.push(current, current + 1, current + columns + 1, current + 1, current + columns + 2, current + columns + 1)
      }
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(coordinates, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function createFeatherBump() {
  const width = 128
  const height = 512
  const pixels = new Uint8Array(width * height)
  for (let vertical = 0; vertical < height; vertical += 1) {
    for (let horizontal = 0; horizontal < width; horizontal += 1) {
      const distance = Math.abs(horizontal - width / 2)
      const ridge = Math.exp(-distance * distance / 14) * 65
      const barbs = Math.sin((vertical + distance * 1.1) * 0.68) * 16
      pixels[vertical * width + horizontal] = Math.round(120 + ridge + barbs)
    }
  }
  const texture = new THREE.DataTexture(pixels, width, height, THREE.RedFormat)
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return texture
}

export function createShuttleModel() {
  const shuttle = new THREE.Group()
  shuttle.name = 'ABPL shuttle'
  const bumpMap = createFeatherBump()
  const colorPixels = new Uint8Array(bumpMap.image.data.length * 4)
  bumpMap.image.data.forEach((value, index) => {
    const tone = Math.round(Math.min(254, 239 + (value - 120) * 0.24))
    colorPixels.set([tone, tone + 1, tone - 4, 255], index * 4)
  })
  const colorMap = new THREE.DataTexture(colorPixels, 128, 512)
  colorMap.colorSpace = THREE.SRGBColorSpace
  colorMap.magFilter = THREE.LinearFilter
  colorMap.minFilter = THREE.LinearFilter
  colorMap.needsUpdate = true
  const featherMaterial = new THREE.MeshStandardMaterial({ color: '#f4f4ec', map: colorMap, roughness: 0.8, metalness: 0, side: THREE.DoubleSide, bumpMap, bumpScale: 0.045 })
  const shaftMaterial = new THREE.MeshStandardMaterial({ color: '#d2d7cf', roughness: 0.8 })
  const leatherMaterial = new THREE.MeshStandardMaterial({ color: '#e8e5db', roughness: 0.76 })
  const bandMaterial = new THREE.MeshStandardMaterial({ color: '#c4a05a', metalness: 0.48, roughness: 0.34 })
  const featherGeometry = createFeatherGeometry()
  const shaftGeometry = new THREE.CylinderGeometry(0.008, 0.017, 2.58, 6)

  for (let index = 0; index < 16; index += 1) {
    const angle = index / 16 * Math.PI * 2
    const feather = new THREE.Group()
    feather.name = `feather-${index + 1}`
    feather.position.set(Math.sin(angle) * 0.2, -0.9, Math.cos(angle) * 0.2)
    feather.rotation.set(0, angle, 0)
    const fan = new THREE.Group()
    fan.rotation.x = 0.34
    const plume = new THREE.Mesh(featherGeometry, featherMaterial)
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial)
    shaft.position.y = 1.34
    shaft.position.z = 0.07
    fan.add(plume, shaft)
    feather.add(fan)
    shuttle.add(feather)
  }

  const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.32, 0.36, 40), leatherMaterial)
  cork.position.y = -1.08
  cork.name = 'leather base'
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.32, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), leatherMaterial)
  cap.position.y = -1.26
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.316, 0.316, 0.08, 40), bandMaterial)
  band.position.y = -0.9
  shuttle.add(cork, cap, band)

  for (const height of [-0.5, 0.05]) {
    const radius = 0.2 + (height + 0.9) * Math.tan(0.34)
    const stitching = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.009, 5, 64), shaftMaterial)
    stitching.rotation.x = Math.PI / 2
    stitching.position.y = height
    shuttle.add(stitching)
  }

  shuttle.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true
      object.receiveShadow = true
    }
  })
  return shuttle
}

export function disposeShuttleModel(model) {
  const geometries = new Set()
  const materials = new Set()
  const textures = new Set()
  model.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry)
    if (object.material) {
      materials.add(object.material)
      for (const value of Object.values(object.material)) {
        if (value?.isTexture) textures.add(value)
      }
    }
  })
  geometries.forEach((geometry) => geometry.dispose())
  materials.forEach((material) => material.dispose())
  textures.forEach((texture) => texture.dispose())
}

export function createShuttleScene(canvas, gsap) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.9
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50)
  camera.position.set(0, 0, 8.5)
  const model = createShuttleModel()
  scene.add(model, new THREE.HemisphereLight('#d7e3df', '#3c453e', 0.85))
  const key = new THREE.DirectionalLight('#fff4dd', 3)
  key.position.set(-3, 5, 4)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 4, bottom: -3, near: 0.1, far: 20 })
  key.shadow.normalBias = 0.018
  key.shadow.bias = -0.0001
  const rim = new THREE.DirectionalLight('#b7cbd4', 1.4)
  rim.position.set(4, 2, -3)
  const fill = new THREE.DirectionalLight('#e4e8d9', 0.55)
  fill.position.set(1, -3, 4)
  scene.add(key, rim, fill)

  const pose = { turnX: 0.12, turnY: -0.48, turnZ: -0.66, travel: 0 }
  let frame = 0
  let enabled = false
  let disposed = false
  let introduced = false
  let compact = false
  let baseX = 0
  let baseY = -0.6
  let baseTurnZ = -0.66
  let scrollProgress = 0
  let pointerX = 0
  let pointerY = 0

  function draw() {
    frame = 0
    if (disposed) return
    model.rotation.set(pose.turnX, pose.turnY, pose.turnZ)
    model.position.set(baseX - pose.travel * 0.45, baseY + pose.travel * 0.28, 0)
    renderer.render(scene, camera)
  }

  function schedule() {
    if (!disposed && !frame) frame = requestAnimationFrame(draw)
  }

  function animate() {
    if (!enabled || disposed) return
    gsap.to(pose, {
      turnX: 0.12 + pointerY * 0.14 + scrollProgress * 0.25,
      turnY: -0.48 + pointerX * 0.28 + scrollProgress * 0.8,
      turnZ: baseTurnZ + pointerX * 0.06 + scrollProgress * (compact ? 0.08 : 0.35),
      travel: scrollProgress,
      duration: 0.65,
      ease: 'power3.out',
      overwrite: true,
      onUpdate: schedule,
    })
  }

  function resize(width, height, mobileSpace) {
    if (!width || !height || disposed) return
    compact = width <= 960
    gsap.killTweensOf(pose)
    baseTurnZ = compact ? -1.24 : -0.66
    Object.assign(pose, { turnX: 0.12, turnY: -0.48, turnZ: baseTurnZ, travel: 0 })
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    const span = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z
    baseX = compact ? 0.08 : span * camera.aspect * 0.22
    baseY = -0.6
    let scale = 1
    if (compact) {
      const top = mobileSpace?.top ?? height * 0.4
      const bottom = mobileSpace?.bottom ?? height * 0.8
      model.rotation.set(pose.turnX, pose.turnY, baseTurnZ)
      model.position.set(0, 0, 0)
      model.scale.setScalar(1)
      const bounds = new THREE.Box3().setFromObject(model)
      const size = bounds.getSize(new THREE.Vector3())
      const center = bounds.getCenter(new THREE.Vector3())
      scale = Math.max(0.18, Math.min(0.88, (bottom - top) / height * span / (size.y * 1.12), span * camera.aspect * 0.86 / (size.x * 1.12)))
      baseX = -center.x * scale
      baseY = (0.5 - (top + bottom) / 2 / height) * span - center.y * scale
    }
    model.scale.setScalar(scale)
    renderer.setSize(width, height, false)
    draw()
  }

  function setActive(active) {
    enabled = active
    if (!active) {
      gsap.killTweensOf(pose)
      cancelAnimationFrame(frame)
      frame = 0
      Object.assign(pose, { turnX: 0.12, turnY: -0.48, turnZ: baseTurnZ, travel: 0 })
      draw()
      return
    }
    if (!introduced) {
      introduced = true
      gsap.fromTo(pose, { turnX: 0.06, turnY: compact ? -0.15 : 0.3, turnZ: baseTurnZ - 0.18 }, { turnX: 0.12, turnY: -0.48, turnZ: baseTurnZ, duration: 1.25, ease: 'power3.out', onUpdate: schedule })
    } else {
      animate()
    }
  }

  return {
    resize,
    setActive,
    setPointer(horizontal, vertical) {
      pointerX = Math.max(-1, Math.min(1, horizontal))
      pointerY = Math.max(-1, Math.min(1, vertical))
      animate()
    },
    setProgress(progress) {
      scrollProgress = Math.max(0, Math.min(1, progress))
      animate()
    },
    capture() {
      draw()
      return canvas.toDataURL('image/png')
    },
    dispose() {
      disposed = true
      gsap.killTweensOf(pose)
      cancelAnimationFrame(frame)
      disposeShuttleModel(model)
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}