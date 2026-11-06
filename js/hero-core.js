import * as THREE from 'three';

export function initHeroCore(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const width = container.clientWidth || 600;
  const height = container.clientHeight || 580;

  const scene = new THREE.Scene();
  scene.background = null; // transparent

  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
  camera.position.set(0, 0.6, 12.5);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Lighting - High-key studio
  const ambientLight = new THREE.HemisphereLight(0xF8FAFC, 0xCBD5E1, 2.6);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xFFFFFF, 3.4);
  keyLight.position.set(-5, 9, 7);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xEFF6FF, 2.0);
  fillLight.position.set(6, 3, -4);
  scene.add(fillLight);

  const warmRim = new THREE.DirectionalLight(0xFFEDD5, 1.2);
  warmRim.position.set(-4, -2, 4);
  scene.add(warmRim);

  // Soft floor contact shadow disc
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(15, 23, 42, 0.28)');
  gradient.addColorStop(0.5, 'rgba(15, 23, 42, 0.12)');
  gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowGeo = new THREE.PlaneGeometry(8, 8);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.85,
    depthWrite: false
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -3.4;
  scene.add(shadowMesh);

  // Physical Materials as per PDF specification
  const ceramicMat = new THREE.MeshPhysicalMaterial({
    color: 0xFFFFFF,
    roughness: 0.22,
    metalness: 0.05,
    clearcoat: 0.8,
    clearcoatRoughness: 0.15
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xE8F2FF,
    transmission: 0.90,
    ior: 1.45,
    thickness: 1.2,
    roughness: 0.14,
    transparent: true,
    opacity: 0.88,
    metalness: 0.08
  });

  const blueMetalMat = new THREE.MeshPhysicalMaterial({
    color: 0x0A58CA,
    metalness: 0.85,
    roughness: 0.20,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1
  });

  const orangeMetalMat = new THREE.MeshPhysicalMaterial({
    color: 0xFF7A00,
    metalness: 0.80,
    roughness: 0.22,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12
  });

  // Root Assembly
  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  // 1. Central Nucleus - 3D Infinity Loop matching Infitej Logo
  const nucleusGroup = new THREE.Group();
  rootGroup.add(nucleusGroup);

  class InfinityCurve extends THREE.Curve {
    constructor(startAngle, endAngle, scaleX = 2.4, scaleY = 1.25, scaleZ = 0.5) {
      super();
      this.start = startAngle;
      this.end = endAngle;
      this.sx = scaleX;
      this.sy = scaleY;
      this.sz = scaleZ;
    }
    getPoint(t, target = new THREE.Vector3()) {
      const u = this.start + (this.end - this.start) * t;
      const x = this.sx * Math.cos(u);
      const y = this.sy * Math.sin(2 * u);
      const z = this.sz * Math.sin(u);
      return target.set(x, y, z);
    }
  }

  // Left infinity loop (Royal Blue)
  const leftCurve = new InfinityCurve(Math.PI / 2, Math.PI * 1.5);
  const leftTubeGeo = new THREE.TubeGeometry(leftCurve, 100, 0.28, 24, false);
  const leftMesh = new THREE.Mesh(leftTubeGeo, blueMetalMat);
  leftMesh.castShadow = true;
  nucleusGroup.add(leftMesh);

  // Right infinity loop (Flame Orange)
  const rightCurve = new InfinityCurve(-Math.PI / 2, Math.PI / 2);
  const rightTubeGeo = new THREE.TubeGeometry(rightCurve, 100, 0.28, 24, false);
  const rightMesh = new THREE.Mesh(rightTubeGeo, orangeMetalMat);
  rightMesh.castShadow = true;
  nucleusGroup.add(rightMesh);

  // Central Stylized 'T' Structure from Logo
  const tGroup = new THREE.Group();
  const tStemGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.4, 24);
  const tStem = new THREE.Mesh(tStemGeo, blueMetalMat);
  tStem.position.set(0, -0.1, 0.05);
  tGroup.add(tStem);

  const tBarGeo = new THREE.BoxGeometry(1.6, 0.24, 0.32);
  const tBar = new THREE.Mesh(tBarGeo, blueMetalMat);
  tBar.position.set(0, 0.6, 0.05);
  tGroup.add(tBar);

  nucleusGroup.add(tGroup);
  nucleusGroup.rotation.set(0.15, -0.25, -0.15);

  // 2. Middle Shell - Refractive Frosted Glass Geodesic Shell
  const middleShellGroup = new THREE.Group();
  rootGroup.add(middleShellGroup);

  const glassIcosahedron = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.8, 1),
    glassMat
  );
  middleShellGroup.add(glassIcosahedron);

  const glassTorus = new THREE.Mesh(
    new THREE.TorusGeometry(3.0, 0.08, 16, 80),
    glassMat
  );
  glassTorus.rotation.x = Math.PI / 2.3;
  middleShellGroup.add(glassTorus);

  // 3. Outer Gimbal Rings - Matte White Ceramic Rings
  const outerRingsGroup = new THREE.Group();
  rootGroup.add(outerRingsGroup);

  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(3.5, 0.12, 20, 100),
    ceramicMat
  );
  ring1.castShadow = true;
  outerRingsGroup.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(3.8, 0.10, 20, 100),
    ceramicMat
  );
  ring2.rotation.x = Math.PI / 2;
  outerRingsGroup.add(ring2);

  const ring3 = new THREE.Mesh(
    new THREE.TorusGeometry(4.1, 0.09, 20, 100),
    ceramicMat
  );
  ring3.rotation.y = Math.PI / 3;
  outerRingsGroup.add(ring3);

  // 4. 12 Orbiting Satellite Nodes (Web, iOS, Android, API, Cloud, ERP/CRM, LLMs, etc.)
  const satelliteGroup = new THREE.Group();
  rootGroup.add(satelliteGroup);

  const satelliteNodes = [];
  const nodeGeo = new THREE.SphereGeometry(0.18, 24, 24);

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const radius = 4.8 + (i % 3) * 0.4;
    const height = Math.sin(angle * 2) * 1.2;
    
    // Alternating blue, orange, and white ceramic materials
    const mat = i % 3 === 0 ? blueMetalMat : (i % 3 === 1 ? orangeMetalMat : ceramicMat);
    const node = new THREE.Mesh(nodeGeo, mat);
    node.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
    node.castShadow = true;
    satelliteGroup.add(node);
    satelliteNodes.push({ mesh: node, angle, radius, heightSpeed: 0.8 + (i % 4) * 0.2 });
  }

  // Interaction State
  let targetRotationX = 0;
  let targetRotationY = 0;
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let explodeFactor = 0;
  let targetExplode = 0;
  let manualRotateOffset = 0;

  // Mouse / Touch Parallax & Drag
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    } else {
      // Subtle parallax when hovering
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / width) * 2 - 1;
      const mouseY = -(((e.clientY - rect.top) / height) * 2 - 1);
      targetRotationY += (mouseX * 0.2 - targetRotationY) * 0.05;
      targetRotationX += (mouseY * 0.2 - targetRotationX) * 0.05;
    }
  });

  // Touch Support
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => { isDragging = false; });

  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  // Public controls
  const stageBtns = container.parentElement.querySelectorAll('.stage-btn');
  stageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      stageBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (action === 'assembled') {
        targetExplode = 0;
      } else if (action === 'exploded') {
        targetExplode = 1;
      } else if (action === 'rotate') {
        manualRotateOffset += Math.PI / 4;
      } else if (action === 'reset') {
        targetExplode = 0;
        manualRotateOffset = 0;
        targetRotationX = 0;
        targetRotationY = 0;
      }
    });
  });

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Smooth Explode Interpolation
    explodeFactor += (targetExplode - explodeFactor) * 0.08;

    // Smooth manual drag & parallax rotation
    rootGroup.rotation.x += (targetRotationX - rootGroup.rotation.x) * 0.08;
    rootGroup.rotation.y += (targetRotationY + manualRotateOffset + elapsedTime * 0.25 - rootGroup.rotation.y) * 0.08;

    // Component Explode offsets
    middleShellGroup.scale.setScalar(1 + explodeFactor * 0.35);
    outerRingsGroup.scale.setScalar(1 + explodeFactor * 0.55);

    // Individual Gimbal Rotations
    ring1.rotation.z += 0.006;
    ring2.rotation.y += 0.008;
    ring3.rotation.x += 0.005;
    glassIcosahedron.rotation.y -= 0.004;

    // Orbiting satellite nodes
    satelliteNodes.forEach((item, index) => {
      const currentRadius = item.radius * (1 + explodeFactor * 0.4);
      const orbitSpeed = 0.4 + (index % 3) * 0.1;
      const currentAngle = item.angle + elapsedTime * orbitSpeed;
      item.mesh.position.x = Math.cos(currentAngle) * currentRadius;
      item.mesh.position.z = Math.sin(currentAngle) * currentRadius;
      item.mesh.position.y = Math.sin(elapsedTime * item.heightSpeed + index) * (1.2 + explodeFactor * 0.8);
    });

    // Shadow pulse
    shadowMesh.scale.setScalar(1 + Math.sin(elapsedTime * 1.5) * 0.04 - explodeFactor * 0.15);

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    if (!container) return;
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
}

