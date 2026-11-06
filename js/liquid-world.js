import * as THREE from 'three';

/**
 * Infitej Liquid Display & 3D WebGL Engine
 * Inspired by high-end liquid glass interfaces (Navy, Cream & Coral palette).
 * Features:
 *  - Interactive GPU Liquid Caustics & Fluted Glass Shader
 *  - Refined Physical 3D Glass & Coral Infinity Möbius Core
 *  - Responsive mouse-driven ripples and slow-motion scroll inertia
 *  - Seamless adaptation for both desktop and mobile viewports
 */
export class LiquidWorld {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) throw new Error('Canvas element not found: ' + canvasId);

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.mouse = new THREE.Vector2(0.5, 0.5);
    this.targetMouse = new THREE.Vector2(0.5, 0.5);
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;
    this.prevScrollProgress = 0;
    this.scrollSpeed = 0;

    this.initScene();
    this.initLiquidShader();
    this.initHeroCore();
    this.initEvents();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initScene() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 0, 9);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // Lighting setup for luxury glass & metallic coral
    const ambient = new THREE.AmbientLight(0x0F172A, 1.8);
    this.scene.add(ambient);

    this.coralLight = new THREE.PointLight(0xFF6B50, 4.5, 18);
    this.coralLight.position.set(2, 1, 3);
    this.scene.add(this.coralLight);

    this.blueKey = new THREE.DirectionalLight(0x38BDF8, 2.5);
    this.blueKey.position.set(-5, 6, 4);
    this.scene.add(this.blueKey);

    const softFill = new THREE.DirectionalLight(0xFDFBF7, 1.4);
    softFill.position.set(4, -3, 2);
    this.scene.add(softFill);
  }

  // =========================================================================
  // 1. LIQUID CAUSTICS & FLUTED GLASS SHADER (BACKGROUND LAYER)
  // =========================================================================
  initLiquidShader() {
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform float uScroll;
      uniform float uScrollSpeed;
      varying vec2 vUv;

      // Simplex noise utilities
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = vUv;

        // Fluted vertical glass ribbed refraction
        float ribCount = 85.0;
        float ribOffset = sin(uv.x * ribCount * 3.14159) * 0.0055;
        uv.x += ribOffset;

        // Fluid liquid motion with slow-motion scroll influence
        float t = uTime * 0.20;
        vec2 liquidP = uv * 2.2 + vec2(uScroll * 0.45, -uScroll * 0.25);

        float dynamicStir = uScrollSpeed * 1.5;
        float n1 = snoise(liquidP + vec2(t * 0.5, t * 0.3) + dynamicStir);
        float n2 = snoise(liquidP * 1.8 - vec2(t * 0.4, n1 * 0.8));
        float combinedNoise = (n1 + n2 * 0.6) * 0.5;

        // Mouse interaction glow center
        float distToMouse = distance(uv, uMouse);
        float mouseGlow = smoothstep(0.65, 0.0, distToMouse) * 0.22;

        // Luxury Palette: Deep Navy, Midnight Slate, Radiant Coral, Warm Cream Sheen
        vec3 deepNavy    = vec3(0.035, 0.062, 0.125); // #091020
        vec3 midnightBlue= vec3(0.058, 0.105, 0.188); // #0F1B30
        vec3 radiantCoral= vec3(1.0, 0.42, 0.314);    // #FF6B50
        vec3 softAmber   = vec3(1.0, 0.58, 0.42);     // #FF946B

        // Aurora fluid liquid gradient
        float coralMix = smoothstep(-0.25, 0.65, combinedNoise + (uv.x - 0.4) * 0.5 + mouseGlow);
        coralMix = pow(coralMix, 1.8) * 0.72;

        vec3 bgColor = mix(deepNavy, midnightBlue, uv.y + sin(uv.x * 3.0 + t) * 0.15);
        vec3 liquidColor = mix(radiantCoral, softAmber, combinedNoise * 0.5 + 0.5);

        vec3 finalColor = mix(bgColor, liquidColor, coralMix);

        // Fluted rib highlight sheen
        float ribHighlight = pow(abs(cos(uv.x * ribCount * 3.14159)), 14.0) * 0.045;
        finalColor += vec3(ribHighlight * 0.9, ribHighlight * 0.95, ribHighlight * 1.0);

        // Subtle vignette
        float vignette = smoothstep(1.2, 0.4, distance(vUv, vec2(0.5)));
        finalColor *= (0.76 + 0.24 * vignette);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    this.liquidUniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(this.width, this.height) },
      uMouse: { value: new THREE.Vector2(0.65, 0.5) },
      uScroll: { value: 0 },
      uScrollSpeed: { value: 0 }
    };

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.liquidUniforms,
      depthWrite: false,
      depthTest: false
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial);
    this.liquidCamera = new THREE.Camera();
    this.liquidScene = new THREE.Scene();
    this.liquidScene.add(quad);
  }

  // =========================================================================
  // 2. REFINED PHYSICAL 3D GLASS & CORAL INFINITY CORE
  // =========================================================================
  initHeroCore() {
    this.coreGroup = new THREE.Group();
    this.updateCoreLayout();
    this.scene.add(this.coreGroup);

    // Refined Physical Frosted Glass Material (Forward-rendered for 60fps)
    this.glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xFDFBF7,
      roughness: 0.1,
      metalness: 0.05,
      transparent: true,
      opacity: 0.55,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9
    });

    // Metallic Coral Ribbon Material (matches logo & theme)
    this.coralMetallic = new THREE.MeshPhysicalMaterial({
      color: 0xFF6B50,
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1
    });

    // Deep Navy Anodized Material
    this.navyMetallic = new THREE.MeshPhysicalMaterial({
      color: 0x1E3A8A,
      metalness: 0.88,
      roughness: 0.2,
      clearcoat: 0.8
    });

    // Sculpted 3D Infinity Loop
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

    // Left Loop: Deep Navy / Cobalt
    const leftLoop = new THREE.Mesh(
      new THREE.TubeGeometry(new InfinityCurve(Math.PI / 2, Math.PI * 1.5), 100, 0.28, 32, false),
      this.navyMetallic
    );
    this.coreGroup.add(leftLoop);

    // Right Loop: Luminous Coral
    const rightLoop = new THREE.Mesh(
      new THREE.TubeGeometry(new InfinityCurve(-Math.PI / 2, Math.PI / 2), 100, 0.28, 32, false),
      this.coralMetallic
    );
    this.coreGroup.add(rightLoop);

    // Central Stylized 'T'
    const tStem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.4, 32), this.navyMetallic);
    tStem.position.set(0, -0.08, 0.05);
    this.coreGroup.add(tStem);

    const tBar = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.24, 0.3), this.coralMetallic);
    tBar.position.set(0, 0.58, 0.05);
    this.coreGroup.add(tBar);

    // Pure Physical Refractive Outer Glass Ring
    this.outerGlassRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.6, 0.12, 32, 120),
      this.glassMaterial
    );
    this.coreGroup.add(this.outerGlassRing);

    // Soft Cream Halo Ring
    const haloGeo = new THREE.TorusGeometry(3.9, 0.04, 16, 120);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xFDFBF7, transparent: true, opacity: 0.35 });
    this.outerHalo = new THREE.Mesh(haloGeo, haloMat);
    this.outerHalo.rotation.x = Math.PI / 2.2;
    this.coreGroup.add(this.outerHalo);

    this.coreGroup.rotation.set(0.18, -0.25, -0.12);
  }

  updateCoreLayout() {
    if (!this.coreGroup) return;
    const isMobile = this.width < 900;
    if (isMobile) {
      this.coreBaseX = 0;
      this.coreBaseY = 1.0;
      this.coreGroup.scale.set(0.68, 0.68, 0.68);
    } else {
      this.coreBaseX = 2.6;
      this.coreBaseY = 0.25;
      this.coreGroup.scale.set(1.0, 1.0, 1.0);
    }
  }

  initEvents() {
    window.addEventListener('scroll', () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      this.targetScrollProgress = window.scrollY / maxScroll;
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = e.clientX / this.width;
      this.targetMouse.y = 1.0 - (e.clientY / this.height);
    }, { passive: true });

    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
      if (this.liquidUniforms) {
        this.liquidUniforms.uResolution.value.set(this.width, this.height);
      }
      this.updateCoreLayout();
    });
  }

  animate() {
    requestAnimationFrame(this.animate);

    const now = performance.now();
    const dt = Math.min((now - (this.lastFrameTime || now)) * 0.001, 0.05);
    this.lastFrameTime = now;

    // Ultra-smooth frame-rate independent exponential interpolation
    const scrollFactor = 1 - Math.exp(-8.0 * dt);
    this.prevScrollProgress = this.scrollProgress;
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * scrollFactor;
    this.scrollSpeed = Math.abs(this.scrollProgress - this.prevScrollProgress);

    const mouseFactor = 1 - Math.exp(-5.5 * dt);
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * mouseFactor;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * mouseFactor;

    const time = now * 0.001;

    // Update liquid caustics shader
    if (this.liquidUniforms) {
      this.liquidUniforms.uTime.value = time;
      this.liquidUniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
      this.liquidUniforms.uScroll.value = this.scrollProgress;
      this.liquidUniforms.uScrollSpeed.value = this.scrollSpeed;
    }

    // Dynamic point light following coral glow
    if (this.coralLight) {
      this.coralLight.position.x = 2.0 + Math.sin(time * 0.8) * 1.5;
      this.coralLight.position.y = 0.5 + Math.cos(time * 0.6) * 1.0;
    }

    // Gentle 3D Core motion & slow-motion parallax
    if (this.coreGroup) {
      const mouseParallaxX = (this.mouse.x - 0.5) * 0.7;
      const mouseParallaxY = (this.mouse.y - 0.5) * 0.5;

      const isMobile = this.width < 900;
      if (isMobile) {
        this.coreGroup.position.x = this.coreBaseX + mouseParallaxX;
        this.coreGroup.position.y = this.coreBaseY - this.scrollProgress * 2.0 + mouseParallaxY;
        this.coreGroup.position.z = -this.scrollProgress * 3.0;
      } else {
        this.coreGroup.position.x = this.coreBaseX - this.scrollProgress * 1.2 + mouseParallaxX;
        this.coreGroup.position.y = this.coreBaseY - this.scrollProgress * 2.5 + mouseParallaxY;
        this.coreGroup.position.z = -this.scrollProgress * 4.0;
      }

      // Elegant slow rotation
      this.coreGroup.rotation.y = time * 0.22 + mouseParallaxX * 0.4;
      this.outerGlassRing.rotation.z = time * 0.14;
      this.outerHalo.rotation.y = time * 0.18;
    }

    // First render background liquid shader
    this.renderer.autoClear = false;
    this.renderer.clear();
    this.renderer.render(this.liquidScene, this.liquidCamera);

    // Then render the 3D physical glass core over it
    this.renderer.render(this.scene, this.camera);
  }
}
