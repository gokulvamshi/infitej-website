import * as THREE from 'three';

export function initDeliveryGlobe(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const width = container.clientWidth || 600;
  const height = container.clientHeight || 520;

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0, 1.5, 9.5);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  container.appendChild(renderer.domElement);

  // Soft lighting for pure light theme
  const hemi = new THREE.HemisphereLight(0xFFFFFF, 0xCBD5E1, 2.5);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xFFFFFF, 2.5);
  dir.position.set(-5, 8, 5);
  scene.add(dir);

  const blueRim = new THREE.DirectionalLight(0x0A58CA, 1.5);
  blueRim.position.set(5, -2, -4);
  scene.add(blueRim);

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // 1. Alabaster Base Globe Sphere
  const globeRadius = 3.2;
  const sphereGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
  const sphereMat = new THREE.MeshPhysicalMaterial({
    color: 0xF8FAFC,
    roughness: 0.35,
    metalness: 0.05,
    clearcoat: 0.4
  });
  const globeMesh = new THREE.Mesh(sphereGeo, sphereMat);
  globeGroup.add(globeMesh);

  // 2. Latitude / Longitude Wireframe Rings
  const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(globeRadius + 0.02, 24, 24));
  const wireMat = new THREE.LineBasicMaterial({ color: 0xE2E8F0, transparent: true, opacity: 0.6 });
  const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
  globeGroup.add(wireMesh);

  // 3. Coordinate conversion helper (Lat, Lon) -> 3D Vector3
  function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  // 4. Global Engineering Hubs
  const hubs = [
    { name: 'Munich', lat: 48.13, lon: 11.58, role: 'Central European Hub' },
    { name: 'Bengaluru', lat: 12.97, lon: 77.59, role: 'Global Engineering & AI Core' },
    { name: 'London', lat: 51.50, lon: -0.12, role: 'UK & EMEA FinTech Hub' },
    { name: 'San Francisco', lat: 37.77, lon: -122.41, role: 'Americas Enterprise Hub' },
    { name: 'Singapore', lat: 1.35, lon: 103.81, role: 'APAC Operations' },
    { name: 'Tokyo', lat: 35.67, lon: 139.65, role: 'Japan & Far East Hub' }
  ];

  const hubPinGeo = new THREE.SphereGeometry(0.1, 16, 16);
  const hubPinMat = new THREE.MeshBasicMaterial({ color: 0xFF7A00 });
  const hubBlueMat = new THREE.MeshBasicMaterial({ color: 0x0A58CA });

  const hubVectors = [];
  hubs.forEach((hub, idx) => {
    const pos = latLonToVector3(hub.lat, hub.lon, globeRadius + 0.06);
    hubVectors.push({ ...hub, pos });

    const pin = new THREE.Mesh(hubPinGeo, idx === 1 ? hubPinMat : hubBlueMat);
    pin.position.copy(pos);
    globeGroup.add(pin);

    // Pulsing halo ring around hub
    const haloGeo = new THREE.RingGeometry(0.12, 0.22, 24);
    const haloMat = new THREE.MeshBasicMaterial({
      color: idx === 1 ? 0xFF7A00 : 0x0A58CA,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(pos.clone().multiplyScalar(1.01));
    halo.lookAt(pos.clone().multiplyScalar(2));
    globeGroup.add(halo);
  });

  // 5. 3D Orbital Arcs between Hubs
  function createOrbitalArc(v1, v2, color = 0x0A58CA) {
    const mid = v1.clone().add(v2).multiplyScalar(0.5);
    const distance = v1.distanceTo(v2);
    // Push midpoint out to form an arch
    mid.normalize().multiplyScalar(globeRadius + distance * 0.35);

    const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.75,
      linewidth: 2
    });
    return new THREE.Line(geometry, material);
  }

  // Connect Bengaluru to Munich, London, SF, Singapore, Tokyo
  const bgl = hubVectors[1].pos; // Bengaluru
  const arcs = [
    createOrbitalArc(bgl, hubVectors[0].pos, 0x0A58CA), // Munich
    createOrbitalArc(bgl, hubVectors[2].pos, 0x0A58CA), // London
    createOrbitalArc(bgl, hubVectors[3].pos, 0xFF7A00), // SF
    createOrbitalArc(bgl, hubVectors[4].pos, 0xFF7A00), // Singapore
    createOrbitalArc(bgl, hubVectors[5].pos, 0x0A58CA), // Tokyo
    createOrbitalArc(hubVectors[0].pos, hubVectors[3].pos, 0x0A58CA) // Munich to SF
  ];
  arcs.forEach(arc => globeGroup.add(arc));

  // Particle cloud on globe surface for landmass approximation
  const particleCount = 600;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const lat = (Math.random() - 0.5) * 160;
    const lon = (Math.random() - 0.5) * 360;
    const v = latLonToVector3(lat, lon, globeRadius + 0.04);
    particlePos[i * 3] = v.x;
    particlePos[i * 3 + 1] = v.y;
    particlePos[i * 3 + 2] = v.z;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x0A58CA,
    size: 0.04,
    transparent: true,
    opacity: 0.45
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  globeGroup.add(particles);

  // Mouse / Touch Rotation
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let targetRotY = 0.5;
  let targetRotX = 0.2;

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
      targetRotY += deltaX * 0.007;
      targetRotX += deltaY * 0.007;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    }
  });

  // Touch handlers
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
      targetRotY += deltaX * 0.01;
      targetRotX += deltaY * 0.01;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (!isDragging) {
      targetRotY += 0.003; // Gentle auto-spin
    }

    globeGroup.rotation.y += (targetRotY - globeGroup.rotation.y) * 0.08;
    globeGroup.rotation.x += (targetRotX - globeGroup.rotation.x) * 0.08;

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

