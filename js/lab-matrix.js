import * as THREE from 'three';

export function initLabMatrix(containerId, terminalId) {
  const container = document.getElementById(containerId);
  const terminal = document.getElementById(terminalId);
  if (!container) return;

  const width = container.clientWidth || 550;
  const height = container.clientHeight || 380;

  const scene = new THREE.Scene();
  scene.background = null;

  // Orthographic isometric camera for crisp architectural view
  const aspect = width / height;
  const d = 5.2;
  const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 50);
  camera.position.set(7.5, 8.5, 9.5);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Lighting
  const hemi = new THREE.HemisphereLight(0xF8FAFC, 0xCBD5E1, 2.5);
  scene.add(hemi);

  const dirLight = new THREE.DirectionalLight(0xFFFFFF, 3.2);
  dirLight.position.set(-4, 10, 6);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(1024, 1024);
  scene.add(dirLight);

  const blueFill = new THREE.DirectionalLight(0xD6E8FF, 1.8);
  blueFill.position.set(6, 4, -4);
  scene.add(blueFill);

  // Studio base plate
  const plateGeo = new THREE.BoxGeometry(7.6, 0.18, 7.6);
  const plateMat = new THREE.MeshPhysicalMaterial({
    color: 0xF1F5F9,
    roughness: 0.3,
    metalness: 0.05
  });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.y = -0.15;
  plate.receiveShadow = true;
  scene.add(plate);

  // 144 Instanced Porcelain and Glass Nodes (12 x 12 grid)
  const nodeCount = 144;
  const gridSize = 12;
  const spacing = 0.55;
  const offset = ((gridSize - 1) * spacing) / 2;

  const cubeGeo = new THREE.BoxGeometry(0.32, 0.32, 0.32);
  const cubeMat = new THREE.MeshPhysicalMaterial({
    color: 0xFFFFFF,
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 0.6
  });

  const instancedNodes = new THREE.InstancedMesh(cubeGeo, cubeMat, nodeCount);
  instancedNodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  instancedNodes.castShadow = true;
  instancedNodes.receiveShadow = true;
  scene.add(instancedNodes);

  // Setup initial node colors & matrices
  const dummy = new THREE.Object3D();
  const nodePositions = [];
  const nodeColors = new Float32Array(nodeCount * 3);

  const colorWhite = new THREE.Color(0xF8FAFC);
  const colorBlue = new THREE.Color(0x0A58CA);
  const colorOrange = new THREE.Color(0xFF7A00);
  const colorRed = new THREE.Color(0xEF4444);

  let idx = 0;
  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      const posX = x * spacing - offset;
      const posZ = z * spacing - offset;
      const posY = 0.18;

      dummy.position.set(posX, posY, posZ);
      dummy.updateMatrix();
      instancedNodes.setMatrixAt(idx, dummy.matrix);

      nodePositions.push({ x: posX, y: posY, z: posZ, baseHeight: posY, broken: false });

      // Default porcelain color with occasional blue accents
      if (Math.random() < 0.15) {
        colorBlue.toArray(nodeColors, idx * 3);
      } else {
        colorWhite.toArray(nodeColors, idx * 3);
      }
      idx++;
    }
  }

  instancedNodes.instanceColor = new THREE.InstancedBufferAttribute(nodeColors, 3);
  instancedNodes.instanceMatrix.needsUpdate = true;
  instancedNodes.instanceColor.needsUpdate = true;

  // Visual Scan Plane for Mode 2
  const scanPlaneGeo = new THREE.PlaneGeometry(7.6, 0.2);
  const scanPlaneMat = new THREE.MeshBasicMaterial({
    color: 0x0A58CA,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide
  });
  const scanPlane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
  scanPlane.rotation.x = Math.PI / 2;
  scanPlane.position.y = 0.4;
  scanPlane.visible = false;
  scene.add(scanPlane);

  // Self-Healing Laser Beam for Mode 3
  const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 8, 16);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xFF7A00,
    transparent: true,
    opacity: 0.8
  });
  const healBeam = new THREE.Mesh(beamGeo, beamMat);
  healBeam.rotation.z = Math.PI / 4;
  healBeam.position.set(0, 1.2, 0);
  healBeam.visible = false;
  scene.add(healBeam);

  // Spline conduit lines connecting key nodes
  const splineMat = new THREE.LineBasicMaterial({ color: 0xFF7A00, transparent: true, opacity: 0.65 });
  const splinePoints = [];
  for (let i = 0; i < 8; i++) {
    const p1 = nodePositions[Math.floor(Math.random() * nodeCount)];
    const p2 = nodePositions[Math.floor(Math.random() * nodeCount)];
    splinePoints.push(new THREE.Vector3(p1.x, 0.35, p1.z));
    splinePoints.push(new THREE.Vector3((p1.x + p2.x)/2, 0.6, (p1.z + p2.z)/2));
    splinePoints.push(new THREE.Vector3(p2.x, 0.35, p2.z));
  }
  const splineGeo = new THREE.BufferGeometry().setFromPoints(splinePoints);
  const splineMesh = new THREE.Line(splineGeo, splineMat);
  scene.add(splineMesh);

  // Terminal logging utility
  function logTerminal(tag, message, isSuccess = false) {
    if (!terminal) return;
    const time = new Date().toISOString().substring(11, 19);
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = `<span class="terminal-tag">[${tag}]</span> ${time} ${isSuccess ? '<span class="terminal-success">' + message + '</span>' : message}`;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
  }

  // Active Mode State
  let currentMode = 'mode1'; // 'mode1' | 'mode2' | 'mode3'
  let isHealing = false;
  let scanProgress = 0;

  // Mode Selection Handlers
  const modeBtns = document.querySelectorAll('.lab-mode-btn');
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;

      if (currentMode === 'mode1') {
        scanPlane.visible = false;
        healBeam.visible = false;
        logTerminal('INGESTION', 'Parsing Jira user stories, acceptance criteria & Figma components...');
        setTimeout(() => logTerminal('SYNTHESIS', 'TF-IDF semantic matching mapped 18 automated test specs with human review.', true), 500);
      } else if (currentMode === 'mode2') {
        scanPlane.visible = true;
        healBeam.visible = false;
        logTerminal('VISION-AI', 'Sweeping DOM tree, visual render passes, and network payloads across 2,000+ browsers...');
      } else if (currentMode === 'mode3') {
        triggerSelfHealingSimulation();
      }
    });
  });

  function triggerSelfHealingSimulation() {
    scanPlane.visible = false;
    logTerminal('CHURN-ALERT', 'Production sprint release triggered: 14 element locators broken by DOM tree restructuring.');
    
    // Break 14 nodes (turn red/amber)
    const brokenIndices = [];
    while (brokenIndices.length < 14) {
      const r = Math.floor(Math.random() * nodeCount);
      if (!brokenIndices.includes(r)) {
        brokenIndices.push(r);
        colorRed.toArray(nodeColors, r * 3);
        nodePositions[r].broken = true;
      }
    }
    instancedNodes.instanceColor.needsUpdate = true;
    healBeam.visible = true;

    // Trigger AI healing after 0.8 seconds as specified in PDF
    setTimeout(() => {
      brokenIndices.forEach(idx => {
        colorBlue.toArray(nodeColors, idx * 3);
        nodePositions[idx].broken = false;
      });
      instancedNodes.instanceColor.needsUpdate = true;
      healBeam.visible = false;
      logTerminal('SELF-HEAL', 'AI healing beam re-routed locators in 0.78s via Computer Vision & DOM relational graphs. 0 test failures.', true);
    }, 800);
  }

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Node wave animation
    for (let i = 0; i < nodeCount; i++) {
      const node = nodePositions[i];
      let height = node.baseHeight;

      if (currentMode === 'mode1') {
        height += Math.sin(elapsedTime * 2.5 + node.x * 1.5 + node.z * 1.5) * 0.08;
      } else if (currentMode === 'mode2') {
        height += Math.sin(elapsedTime * 4.0 + node.z * 2.0) * 0.12;
      } else if (node.broken) {
        height += Math.sin(elapsedTime * 10) * 0.06; // jitter when broken
      }

      dummy.position.set(node.x, height, node.z);
      dummy.updateMatrix();
      instancedNodes.setMatrixAt(i, dummy.matrix);
    }
    instancedNodes.instanceMatrix.needsUpdate = true;

    // Mode 2 Scanning Plane Movement
    if (currentMode === 'mode2' && scanPlane.visible) {
      scanProgress += 0.02;
      scanPlane.position.z = Math.sin(scanProgress) * 3.2;
    }

    // Mode 3 Beam sweep
    if (healBeam.visible) {
      healBeam.rotation.y = elapsedTime * 8;
    }

    // Slow rotation of entire scene
    scene.rotation.y = Math.sin(elapsedTime * 0.15) * 0.1;

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    if (!container) return;
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    const newAspect = newWidth / newHeight;
    camera.left = -d * newAspect;
    camera.right = d * newAspect;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
}

