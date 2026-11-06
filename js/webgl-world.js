import * as THREE from 'three';

/**
 * Infitej Master WebGL Spatial Engine
 * Full-viewport persistent 3D canvas with camera choreography,
 * reactive scroll progression, and interactive 3D informational artifacts.
 * Inspired by carnilove.ashfall.studio, noddal.xyz, spectup.com, and emmaus-agir-31.fr.
 */
export class WebGLWorld {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) throw new Error('Canvas not found: ' + canvasId);

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Scroll interpolation
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;
    this.mouse = new THREE.Vector2(0, 0);
    this.targetMouse = new THREE.Vector2(0, 0);

    // Camera choreography targets
    this.camTarget = new THREE.Vector3(0, 0, 11);
    this.camLookTarget = new THREE.Vector3(0, 0, 0);

    // Active state
    this.coreExplodeFactor = 0;
    this.targetCoreExplode = 0;
    this.activeLabMode = 'mode1';
    this.healBeamActive = false;
    this.activeAcceleratorIdx = -1;
    this.activeRingIdx = 0;
    this.activeLifecycleIdx = 0;

    this.initScene();
    this.initLighting();
    this.initHeroCore();
    this.initLabMatrix();
    this.initAcceleratorArtifacts();
    this.initConcentricRings();
    this.initLifecyclePipeline();
    this.initDeliveryGlobe();
    this.initParticles();
    this.initEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xF8FAFC); // Warm Alabaster Studio Cyclorama

    this.camera = new THREE.PerspectiveCamera(42, this.width / this.height, 0.1, 150);
    this.camera.position.set(0, 0, 11);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Materials Library
    this.materials = {
      blueMetal: new THREE.MeshPhysicalMaterial({
        color: 0x0A58CA,
        metalness: 0.85,
        roughness: 0.18,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1
      }),
      orangeMetal: new THREE.MeshPhysicalMaterial({
        color: 0xFF7A00,
        metalness: 0.80,
        roughness: 0.20,
        clearcoat: 0.9,
        clearcoatRoughness: 0.12
      }),
      porcelain: new THREE.MeshPhysicalMaterial({
        color: 0xFFFFFF,
        roughness: 0.22,
        metalness: 0.05,
        clearcoat: 0.8
      }),
      frostedGlass: new THREE.MeshPhysicalMaterial({
        color: 0xE8F2FF,
        transmission: 0.92,
        ior: 1.45,
        thickness: 1.2,
        roughness: 0.14,
        transparent: true,
        opacity: 0.88,
        metalness: 0.05
      }),
      lineOrange: new THREE.LineBasicMaterial({ color: 0xFF7A00, transparent: true, opacity: 0.75, linewidth: 2 }),
      lineBlue: new THREE.LineBasicMaterial({ color: 0x0A58CA, transparent: true, opacity: 0.75, linewidth: 2 })
    };
  }

  initLighting() {
    const ambient = new THREE.HemisphereLight(0xFFFFFF, 0xCBD5E1, 2.6);
    this.scene.add(ambient);

    this.keyLight = new THREE.DirectionalLight(0xFFFFFF, 3.4);
    this.keyLight.position.set(-6, 12, 9);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(2048, 2048);
    this.keyLight.shadow.bias = -0.0004;
    this.scene.add(this.keyLight);

    const rimLight = new THREE.DirectionalLight(0xEFF6FF, 2.2);
    rimLight.position.set(8, 4, -5);
    this.scene.add(rimLight);

    const orangeFill = new THREE.DirectionalLight(0xFFEDD5, 1.2);
    orangeFill.position.set(-5, -4, 5);
    this.scene.add(orangeFill);
  }

  // =========================================================================
  // STAGE 0: HERO AUTONOMOUS QUALITY CORE (Y: 0)
  // =========================================================================
  initHeroCore() {
    this.heroCoreGroup = new THREE.Group();
    this.heroCoreGroup.position.set(2.4, 0.2, 0); // Positioned nicely on the right of the Hero text
    this.scene.add(this.heroCoreGroup);

    // Sculpted 3D Infinity Loop matching Logo
    this.infinityGroup = new THREE.Group();
    this.heroCoreGroup.add(this.infinityGroup);

    class InfinityCurve extends THREE.Curve {
      constructor(start, end, sx = 2.4, sy = 1.25, sz = 0.5) {
        super();
        this.start = start; this.end = end;
        this.sx = sx; this.sy = sy; this.sz = sz;
      }
      getPoint(t, target = new THREE.Vector3()) {
        const u = this.start + (this.end - this.start) * t;
        return target.set(this.sx * Math.cos(u), this.sy * Math.sin(2 * u), this.sz * Math.sin(u));
      }
    }

    const leftLoop = new THREE.Mesh(
      new THREE.TubeGeometry(new InfinityCurve(Math.PI / 2, Math.PI * 1.5), 100, 0.28, 24, false),
      this.materials.blueMetal
    );
    leftLoop.castShadow = true;
    this.infinityGroup.add(leftLoop);

    const rightLoop = new THREE.Mesh(
      new THREE.TubeGeometry(new InfinityCurve(-Math.PI / 2, Math.PI / 2), 100, 0.28, 24, false),
      this.materials.orangeMetal
    );
    rightLoop.castShadow = true;
    this.infinityGroup.add(rightLoop);

    // Stylized Central 'T'
    const tGroup = new THREE.Group();
    const tStem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.35, 24), this.materials.blueMetal);
    tStem.position.set(0, -0.08, 0.05);
    tGroup.add(tStem);

    const tBar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.24, 0.3), this.materials.blueMetal);
    tBar.position.set(0, 0.58, 0.05);
    tGroup.add(tBar);
    this.infinityGroup.add(tGroup);

    this.infinityGroup.rotation.set(0.18, -0.28, -0.15);

    // Middle Frosted Glass Icosahedron Shell
    this.middleShell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.7, 1),
      this.materials.frostedGlass
    );
    this.heroCoreGroup.add(this.middleShell);

    // Outer Porcelain Gimbal Rings
    this.outerGimbal = new THREE.Group();
    this.heroCoreGroup.add(this.outerGimbal);

    this.ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.12, 20, 100), this.materials.porcelain);
    this.ring1.castShadow = true;
    this.outerGimbal.add(this.ring1);

    this.ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.7, 0.10, 20, 100), this.materials.porcelain);
    this.ring2.rotation.x = Math.PI / 2;
    this.outerGimbal.add(this.ring2);

    this.ring3 = new THREE.Mesh(new THREE.TorusGeometry(4.0, 0.09, 20, 100), this.materials.porcelain);
    this.ring3.rotation.y = Math.PI / 3;
    this.outerGimbal.add(this.ring3);

    // Orbiting Satellites with spline arcs
    this.satellites = [];
    const satGeo = new THREE.SphereGeometry(0.17, 24, 24);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 4.6 + (i % 3) * 0.4;
      const mat = i % 3 === 0 ? this.materials.blueMetal : (i % 3 === 1 ? this.materials.orangeMetal : this.materials.porcelain);
      const mesh = new THREE.Mesh(satGeo, mat);
      mesh.castShadow = true;
      this.heroCoreGroup.add(mesh);
      this.satellites.push({ mesh, angle, radius, speed: 0.35 + (i % 4) * 0.1 });
    }

    // Soft contact shadow disc
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128; shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.28)');
    grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.10)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    this.coreShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.85, depthWrite: false })
    );
    this.coreShadow.rotation.x = -Math.PI / 2;
    this.coreShadow.position.y = -3.5;
    this.heroCoreGroup.add(this.coreShadow);
  }

  // =========================================================================
  // STAGE 2: AUTONOMOUS AI TESTING LAB MATRIX (Y: -22)
  // =========================================================================
  initLabMatrix() {
    this.labGroup = new THREE.Group();
    this.labGroup.position.set(0, -22, -2);
    this.scene.add(this.labGroup);

    // Base architectural platform
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.25, 10),
      this.materials.porcelain
    );
    platform.position.y = -0.2;
    platform.receiveShadow = true;
    this.labGroup.add(platform);

    // 144 Instanced Porcelain & Glass Compute Cubes (12 x 12 grid)
    const gridSize = 12;
    const count = gridSize * gridSize;
    const spacing = 0.65;
    const offset = ((gridSize - 1) * spacing) / 2;

    const cubeGeo = new THREE.BoxGeometry(0.38, 0.38, 0.38);
    this.labNodes = new THREE.InstancedMesh(cubeGeo, this.materials.porcelain, count);
    this.labNodes.castShadow = true;
    this.labNodes.receiveShadow = true;
    this.labNodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.labGroup.add(this.labNodes);

    this.nodePositions = [];
    this.nodeColors = new Float32Array(count * 3);
    const dummy = new THREE.Object3D();
    const colWhite = new THREE.Color(0xF8FAFC);
    const colBlue = new THREE.Color(0x0A58CA);

    let idx = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const px = x * spacing - offset;
        const pz = z * spacing - offset;
        const py = 0.25;

        dummy.position.set(px, py, pz);
        dummy.updateMatrix();
        this.labNodes.setMatrixAt(idx, dummy.matrix);

        this.nodePositions.push({ x: px, y: py, z: pz, baseHeight: py, broken: false });

        if (Math.random() < 0.2) {
          colBlue.toArray(this.nodeColors, idx * 3);
        } else {
          colWhite.toArray(this.nodeColors, idx * 3);
        }
        idx++;
      }
    }
    this.labNodes.instanceColor = new THREE.InstancedBufferAttribute(this.nodeColors, 3);
    this.labNodes.instanceMatrix.needsUpdate = true;
    this.labNodes.instanceColor.needsUpdate = true;

    // Mode 2 Scanning Plane
    const scanGeo = new THREE.PlaneGeometry(9.6, 0.4);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x0A58CA, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
    this.scanPlane = new THREE.Mesh(scanGeo, scanMat);
    this.scanPlane.rotation.x = Math.PI / 2;
    this.scanPlane.position.y = 0.6;
    this.scanPlane.visible = false;
    this.labGroup.add(this.scanPlane);

    // Mode 3 Self-Healing Beam
    const beamGeo = new THREE.CylinderGeometry(0.06, 0.06, 12, 16);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xFF7A00, transparent: true, opacity: 0.85 });
    this.healBeam = new THREE.Mesh(beamGeo, beamMat);
    this.healBeam.rotation.z = Math.PI / 4;
    this.healBeam.position.set(0, 1.8, 0);
    this.healBeam.visible = false;
    this.labGroup.add(this.healBeam);

    // Spline connections
    const splinePoints = [];
    for (let i = 0; i < 12; i++) {
      const p1 = this.nodePositions[Math.floor(Math.random() * count)];
      const p2 = this.nodePositions[Math.floor(Math.random() * count)];
      splinePoints.push(new THREE.Vector3(p1.x, 0.45, p1.z));
      splinePoints.push(new THREE.Vector3((p1.x + p2.x) / 2, 0.85, (p1.z + p2.z) / 2));
      splinePoints.push(new THREE.Vector3(p2.x, 0.45, p2.z));
    }
    const splineGeo = new THREE.BufferGeometry().setFromPoints(splinePoints);
    this.labSplines = new THREE.Line(splineGeo, this.materials.lineOrange);
    this.labGroup.add(this.labSplines);
  }

  // =========================================================================
  // STAGE 3: BENTO GRID 3D ARTIFACTS (Y: -44)
  // =========================================================================
  initAcceleratorArtifacts() {
    this.bentoGroup = new THREE.Group();
    this.bentoGroup.position.set(0, -44, -3);
    this.scene.add(this.bentoGroup);

    this.artifacts = [];
    const geometries = [
      new THREE.OctahedronGeometry(1.2, 0),             // 01 FastTrack
      new THREE.ConeGeometry(0.9, 1.8, 6),              // 02 RapidLaunch
      new THREE.DodecahedronGeometry(1.1, 0),           // 03 SuiteSync
      new THREE.TorusKnotGeometry(0.8, 0.25, 64, 16),   // 04 BugBuster
      new THREE.IcosahedronGeometry(1.1, 0),            // 05 CodeProbe
      new THREE.CylinderGeometry(1.2, 1.2, 0.4, 32)     // 06 OmniStream
    ];

    const positions = [
      [-3.5, 2.2, 0], [0, 2.2, 0], [3.5, 2.2, 0],
      [-3.5, -2.2, 0], [0, -2.2, 0], [3.5, -2.2, 0]
    ];

    geometries.forEach((geo, i) => {
      const mat = (i % 2 === 0) ? this.materials.blueMetal : this.materials.orangeMetal;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...positions[i]);
      mesh.castShadow = true;
      this.bentoGroup.add(mesh);
      this.artifacts.push(mesh);
    });
  }

  // =========================================================================
  // STAGE 4: CONCENTRIC QUALITY ECOSYSTEM (Y: -66)
  // =========================================================================
  initConcentricRings() {
    this.concentricGroup = new THREE.Group();
    this.concentricGroup.position.set(2.8, -66, -1);
    this.scene.add(this.concentricGroup);

    this.orbitRings = [];
    const ringRadii = [1.2, 2.0, 2.8, 3.6, 4.4];

    ringRadii.forEach((r, idx) => {
      const isOrange = idx % 2 === 1;
      const ringMesh = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.06, 16, 90),
        isOrange ? this.materials.orangeMetal : this.materials.blueMetal
      );
      ringMesh.rotation.x = Math.PI / 2.4;
      this.concentricGroup.add(ringMesh);
      this.orbitRings.push(ringMesh);

      // Orbital satellite node on each ring
      const sat = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 16, 16),
        isOrange ? this.materials.orangeMetal : this.materials.blueMetal
      );
      this.concentricGroup.add(sat);
      ringMesh.satellite = sat;
      ringMesh.orbitRadius = r;
      ringMesh.orbitSpeed = 0.5 - idx * 0.08;
    });
  }

  // =========================================================================
  // STAGE 5: 6-PHASE LIFECYCLE 3D PIPELINE (Y: -88)
  // =========================================================================
  initLifecyclePipeline() {
    this.lifecycleGroup = new THREE.Group();
    this.lifecycleGroup.position.set(0, -88, -2);
    this.scene.add(this.lifecycleGroup);

    this.pipelineNodes = [];
    const points = [];

    for (let i = 0; i < 6; i++) {
      const x = (i - 2.5) * 1.8;
      const y = Math.sin(i * 1.1) * 0.6;
      const z = Math.cos(i * 1.1) * 0.4;
      const pos = new THREE.Vector3(x, y, z);
      points.push(pos);

      // Pedestal node
      const node = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.4, 0.5, 24),
        i === 0 ? this.materials.orangeMetal : this.materials.blueMetal
      );
      node.position.copy(pos);
      node.castShadow = true;
      this.lifecycleGroup.add(node);
      this.pipelineNodes.push(node);
    }

    const pathCurve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(pathCurve, 64, 0.08, 12, false);
    const tubeMesh = new THREE.Mesh(tubeGeo, this.materials.lineOrange);
    this.lifecycleGroup.add(tubeMesh);
  }

  // =========================================================================
  // STAGE 6/7: 3D GLOBAL DELIVERY GLOBE (Y: -110)
  // =========================================================================
  initDeliveryGlobe() {
    this.globeGroup = new THREE.Group();
    this.globeGroup.position.set(2.4, -110, -1);
    this.scene.add(this.globeGroup);

    const radius = 3.2;
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 64, 64),
      this.materials.porcelain
    );
    sphere.receiveShadow = true;
    this.globeGroup.add(sphere);

    // Wireframe lines
    const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(radius + 0.02, 20, 20));
    const wireMat = new THREE.LineBasicMaterial({ color: 0xE2E8F0, transparent: true, opacity: 0.5 });
    this.globeGroup.add(new THREE.LineSegments(wireGeo, wireMat));

    // Hubs: Munich, Bengaluru, London, San Francisco, Singapore, Tokyo
    function latLonToV3(lat, lon, r) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(r * Math.sin(phi) * Math.cos(theta)),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }

    const hubs = [
      { lat: 48.13, lon: 11.58 }, // Munich
      { lat: 12.97, lon: 77.59 }, // Bengaluru
      { lat: 51.50, lon: -0.12 }, // London
      { lat: 37.77, lon: -122.41 }, // SF
      { lat: 1.35, lon: 103.81 },  // Singapore
      { lat: 35.67, lon: 139.65 }  // Tokyo
    ];

    const hubPinGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const hubPoints = hubs.map((h, i) => {
      const v = latLonToV3(h.lat, h.lon, radius + 0.06);
      const pin = new THREE.Mesh(hubPinGeo, i === 1 ? this.materials.orangeMetal : this.materials.blueMetal);
      pin.position.copy(v);
      this.globeGroup.add(pin);
      return v;
    });

    // Orbital flight arcs connecting Bengaluru to all hubs
    const bgl = hubPoints[1];
    [0, 2, 3, 4, 5].forEach((destIdx, i) => {
      const dest = hubPoints[destIdx];
      const mid = bgl.clone().add(dest).multiplyScalar(0.5);
      const dist = bgl.distanceTo(dest);
      mid.normalize().multiplyScalar(radius + dist * 0.32);
      const curve = new THREE.QuadraticBezierCurve3(bgl, mid, dest);
      const points = curve.getPoints(40);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, i % 2 === 0 ? this.materials.lineBlue : this.materials.lineOrange);
      this.globeGroup.add(line);
    });
  }

  // =========================================================================
  // AMBIENT PARTICLES ACROSS THE ENTIRE 3D WORLD
  // =========================================================================
  initParticles() {
    const count = 600;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = Math.random() * -120 + 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x0A58CA,
      size: 0.07,
      transparent: true,
      opacity: 0.35
    });
    this.ambientParticles = new THREE.Points(geo, mat);
    this.scene.add(this.ambientParticles);
  }

  // =========================================================================
  // CAMERA CHOREOGRAPHY & SCROLL MAPPING
  // =========================================================================
  updateCameraChoreography() {
    const p = this.scrollProgress; // 0.0 to 1.0

    // Smoothly interpolate camera position and target down the 3D scene
    // Total vertical travel corresponds to the HTML scroll distance
    const startY = 0;
    const endY = -110;
    const currentY = startY + (endY - startY) * p;

    // Spatial trajectory: camera sways horizontally to frame each section's floating UI
    let targetX = Math.sin(p * Math.PI * 4) * 1.8;
    let targetZ = 11 + Math.sin(p * Math.PI * 3) * 1.5;

    // Parallax mouse nudge
    targetX += this.mouse.x * 0.8;
    const targetY = currentY + this.mouse.y * 0.5;

    this.camTarget.set(targetX, targetY, targetZ);
    this.camLookTarget.set(this.mouse.x * 0.4, currentY, 0);

    this.camera.position.lerp(this.camTarget, 0.08);
    this.camera.lookAt(this.camLookTarget);
  }

  // =========================================================================
  // EVENT LISTENERS & RESIZE
  // =========================================================================
  initEvents() {
    window.addEventListener('scroll', () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      this.targetScrollProgress = maxScroll > 0 ? (window.scrollY / maxScroll) : 0;
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = (e.clientX / this.width) * 2 - 1;
      this.targetMouse.y = -(e.clientY / this.height) * 2 + 1;
    }, { passive: true });

    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });
  }

  // Interactive triggers
  setCoreExploded(isExploded) {
    this.targetCoreExplode = isExploded ? 1 : 0;
  }

  setLabMode(mode) {
    this.activeLabMode = mode;
    if (this.scanPlane) this.scanPlane.visible = (mode === 'mode2');
  }

  triggerSelfHealing() {
    if (!this.labNodes) return;
    this.healBeamActive = true;
    this.healBeam.visible = true;

    // Break 14 nodes (turn crimson)
    const red = new THREE.Color(0xEF4444);
    const blue = new THREE.Color(0x0A58CA);
    const count = 144;
    const broken = [];
    while (broken.length < 14) {
      const r = Math.floor(Math.random() * count);
      if (!broken.includes(r)) {
        broken.push(r);
        red.toArray(this.nodeColors, r * 3);
      }
    }
    this.labNodes.instanceColor.needsUpdate = true;

    // Heal in 0.8 seconds
    setTimeout(() => {
      broken.forEach(idx => blue.toArray(this.nodeColors, idx * 3));
      this.labNodes.instanceColor.needsUpdate = true;
      this.healBeamActive = false;
      this.healBeam.visible = false;
    }, 800);
  }

  highlightBentoArtifact(idx) {
    this.activeAcceleratorIdx = idx;
  }

  setConcentricRing(idx) {
    this.activeRingIdx = idx;
  }

  setLifecyclePhase(idx) {
    this.activeLifecycleIdx = idx;
    if (this.pipelineNodes) {
      this.pipelineNodes.forEach((node, i) => {
        node.material = (i === idx) ? this.materials.orangeMetal : this.materials.blueMetal;
        node.scale.setScalar(i === idx ? 1.35 : 1.0);
      });
    }
  }

  // =========================================================================
  // MAIN ANIMATION LOOP
  // =========================================================================
  animate() {
    requestAnimationFrame(this.animate);

    // Damping
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.08;
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    // Update Camera
    this.updateCameraChoreography();

    const time = performance.now() * 0.001;

    // 1. Animate Hero Core
    if (this.heroCoreGroup) {
      this.coreExplodeFactor += (this.targetCoreExplode - this.coreExplodeFactor) * 0.08;
      this.middleShell.scale.setScalar(1 + this.coreExplodeFactor * 0.35);
      this.outerGimbal.scale.setScalar(1 + this.coreExplodeFactor * 0.55);

      this.heroCoreGroup.rotation.y = time * 0.25;
      this.ring1.rotation.z += 0.006;
      this.ring2.rotation.y += 0.008;
      this.ring3.rotation.x += 0.005;

      this.satellites.forEach(s => {
        const curRadius = s.radius * (1 + this.coreExplodeFactor * 0.35);
        const curAngle = s.angle + time * s.speed;
        s.mesh.position.set(
          Math.cos(curAngle) * curRadius,
          Math.sin(time * 1.5 + s.angle) * 1.2,
          Math.sin(curAngle) * curRadius
        );
      });
    }

    // 2. Animate Lab Matrix
    if (this.labNodes) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < 144; i++) {
        const node = this.nodePositions[i];
        let h = node.baseHeight;
        if (this.activeLabMode === 'mode1') {
          h += Math.sin(time * 3 + node.x * 1.4 + node.z * 1.4) * 0.08;
        } else if (this.activeLabMode === 'mode2') {
          h += Math.sin(time * 5 + node.z * 2.2) * 0.12;
        }
        dummy.position.set(node.x, h, node.z);
        dummy.updateMatrix();
        this.labNodes.setMatrixAt(i, dummy.matrix);
      }
      this.labNodes.instanceMatrix.needsUpdate = true;

      if (this.scanPlane && this.scanPlane.visible) {
        this.scanPlane.position.z = Math.sin(time * 2.5) * 4.0;
      }
      if (this.healBeamActive && this.healBeam) {
        this.healBeam.rotation.y = time * 10;
      }
    }

    // 3. Animate Bento Artifacts
    if (this.artifacts) {
      this.artifacts.forEach((art, i) => {
        art.rotation.x = time * (0.6 + i * 0.1);
        art.rotation.y = time * (0.8 + i * 0.1);
        if (i === this.activeAcceleratorIdx) {
          art.scale.setScalar(1.3 + Math.sin(time * 5) * 0.1);
        } else {
          art.scale.setScalar(1.0);
        }
      });
    }

    // 4. Animate Concentric Rings
    if (this.orbitRings) {
      this.orbitRings.forEach((ring, idx) => {
        ring.rotation.z = time * ring.orbitSpeed * 0.5;
        const curA = time * ring.orbitSpeed;
        ring.satellite.position.set(
          Math.cos(curA) * ring.orbitRadius,
          Math.sin(curA) * ring.orbitRadius * 0.45,
          Math.sin(curA) * ring.orbitRadius * 0.2
        );
      });
    }

    // 5. Animate Globe
    if (this.globeGroup) {
      this.globeGroup.rotation.y = time * 0.15;
    }

    // Render Master Scene
    this.renderer.render(this.scene, this.camera);
  }
}

