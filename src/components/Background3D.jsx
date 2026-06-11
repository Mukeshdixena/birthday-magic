import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { CONFIG } from "../config";

export default function Background3D({ theme }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // ── Setup Scene, Camera, Renderer ──────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    const renderer = new THREE.WebGLRenderer({
      canvas: containerRef.current,
      antialias: true,
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // ── Parse Colors ──────────────────────────────────────────────────
    const colorPrimary = new THREE.Color(CONFIG.colors.primary);
    const colorAccent = new THREE.Color(CONFIG.colors.accent);
    // Dark/Light background colors
    const colorDarkBg = new THREE.Color(CONFIG.colors.dark.background);
    const colorLightBg = new THREE.Color(CONFIG.colors.light.background);

    // ── Shader Material for Gradient Mesh (Aurora) ──────────────────
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec3 uColorPrimary;
      uniform vec3 uColorAccent;
      uniform vec3 uColorBg;
      uniform float uIsLight;
      varying vec2 vUv;

      // Cosine based palette generators
      vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
        return a + b*cos( 6.28318*(c*t+d) );
      }

      void main() {
        vec2 uv = vUv;
        
        // Fluid noise coordinates
        vec2 q = vec2(0.0);
        q.x = sin(uv.x * 3.0 + uTime * 0.2 + uMouse.x * 0.15);
        q.y = cos(uv.y * 3.0 + uTime * 0.15 + uMouse.y * 0.15);
        
        vec2 r = vec2(0.0);
        r.x = sin(uv.x * 2.0 + q.x * 1.5 + uTime * 0.1);
        r.y = cos(uv.y * 2.0 + q.y * 1.5 + uTime * 0.12);
        
        float f = sin(uv.x * 0.8 + r.x * 1.0 + uTime * 0.05) * 
                  cos(uv.y * 0.8 + r.y * 1.0 + uTime * 0.06);
        
        // Palette interpolation
        vec3 color1 = uColorBg;
        vec3 color2 = uColorPrimary;
        vec3 color3 = uColorAccent;
        
        // Blend layers
        vec3 finalColor = mix(color1, color2, clamp(f * 1.2, 0.0, 1.0));
        finalColor = mix(finalColor, color3, clamp(length(q) * 0.45, 0.0, 1.0));
        
        // Custom spotlight mask based on mouse
        vec2 targetMouse = (uMouse + 1.0) * 0.5; // map -1..1 to 0..1
        float distToMouse = distance(uv, targetMouse);
        
        // Spotlight glow strength
        float spotlight = 1.0 - smoothstep(0.0, 0.85, distToMouse);
        
        if (uIsLight > 0.5) {
          finalColor = mix(finalColor, vec3(1.0), 0.3); // soften for light mode
          finalColor += vec3(spotlight * 0.06);
        } else {
          finalColor += vec3(spotlight * 0.12) * color3;
        }

        // Contrast / Vignette
        float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
        vignette = clamp(pow(16.0 * vignette, 0.25), 0.0, 1.0);
        
        if (uIsLight < 0.5) {
          gl_FragColor = vec4(finalColor * vignette, 1.0);
        } else {
          gl_FragColor = vec4(mix(finalColor, vec3(1.0), (1.0 - vignette) * 0.15), 1.0);
        }
      }
    `;

    const isLight = theme === "light" ? 1.0 : 0.0;
    const currentBg = theme === "light" ? colorLightBg : colorDarkBg;

    const quadMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColorPrimary: { value: colorPrimary },
        uColorAccent: { value: colorAccent },
        uColorBg: { value: currentBg },
        uIsLight: { value: isLight },
      },
      depthWrite: false,
      depthTest: false,
    });

    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(quadGeo, quadMaterial);
    scene.add(quad);

    // ── Floating 3D Particle System ───────────────────────────────
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      // Coordinates inside viewport bounds
      positions[i] = (Math.random() - 0.5) * 2.5;     // X
      positions[i + 1] = (Math.random() - 0.5) * 2.5; // Y
      positions[i + 2] = (Math.random() - 0.5) * 2.0; // Z depth
      
      // Speed coefficients
      speeds[i] = (Math.random() - 0.5) * 0.01;
      speeds[i + 1] = (Math.random() * 0.015 + 0.005); // float up
      speeds[i + 2] = (Math.random() - 0.5) * 0.01;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Custom circular particle texture using canvas
    const createParticleTexture = () => {
      const size = 16;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.3, "rgba(255, 255, 255, 0.8)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      
      const tex = new THREE.CanvasTexture(canvas);
      return tex;
    };

    const particleMat = new THREE.PointsMaterial({
      color: theme === "light" ? colorAccent : 0xffffff,
      size: 0.035,
      transparent: true,
      opacity: theme === "light" ? 0.4 : 0.75,
      map: createParticleTexture(),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Floating 3D Assets (Balloon, Cake, Gift Box) ───────────────
    const textureLoader = new THREE.TextureLoader();
    const base = import.meta.env.BASE_URL || '/';
    const texBalloon = textureLoader.load(base + "asets/Cute Balloon.png");
    const texCake = textureLoader.load(base + "asets/Cute Birthday Cake.png");
    const texGift = textureLoader.load(base + "asets/Cute Gift Box.png");

    const floaters = [];
    const floaterCount = 6;
    const floaterTextures = [texBalloon, texCake, texGift];
    const floaterGeometry = new THREE.PlaneGeometry(1, 1);

    for (let i = 0; i < floaterCount; i++) {
      const tex = floaterTextures[i % floaterTextures.length];
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: theme === "light" ? 0.16 : 0.26,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(floaterGeometry, mat);

      // Distribute randomly in camera range
      const baseX = (Math.random() - 0.5) * 2.6;
      const baseY = (Math.random() - 0.5) * 2.6;
      
      // Z coordinate (0.1 to 0.8) used as depth parameter
      const baseZ = Math.random() * 0.7 + 0.1;
      mesh.position.set(baseX, baseY, baseZ);

      // Manual size based on depth (simulate perspective in Orthographic space)
      const scale = 0.14 + baseZ * 0.24; // map 0.1..0.8 to ~0.16..0.33
      mesh.scale.set(scale, scale, 1);

      mesh.userData = {
        baseX: baseX,
        baseY: baseY,
        speedY: (0.0008 + baseZ * 0.0016) * 1.5, // closer objects float faster
        driftXSpeed: Math.random() * 0.6 + 0.2,
        driftXAmp: Math.random() * 0.0012 + 0.0008,
        rotSpeed: (Math.random() - 0.5) * 0.008,
        phase: Math.random() * Math.PI * 2,
      };

      scene.add(mesh);
      floaters.push(mesh);
    }

    // ── Mouse Interaction Handling ──────────────────────────────────
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const onMouseMove = (e) => {
      // Map to -1..1
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", onMouseMove);

    // ── Resize Handler ──────────────────────────────────────────────
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", onResize);

    // ── Animation Loop ──────────────────────────────────────────────
    let animationFrameId = null;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      quadMaterial.uniforms.uTime.value = elapsed;

      // Smooth mouse interpolation (Lerp)
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;
      quadMaterial.uniforms.uMouse.value.set(currentMouseX, currentMouseY);

      // Animate Particles
      const posArr = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount * 3; i += 3) {
        // Move particle
        posArr[i] += speeds[i]; // float x
        posArr[i + 1] += speeds[i + 1]; // float y (upwards)
        posArr[i + 2] += speeds[i + 2]; // float z

        // Scroll wrap bounds
        if (posArr[i + 1] > 1.25) {
          posArr[i + 1] = -1.25;
          posArr[i] = (Math.random() - 0.5) * 2.5;
        }
        // Drift bounds
        if (posArr[i] > 1.5) posArr[i] = -1.5;
        if (posArr[i] < -1.5) posArr[i] = 1.5;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Mouse interactive parallax on particles
      particles.rotation.x = currentMouseY * 0.15;
      particles.rotation.y = currentMouseX * 0.15;

      // Animate Floating 3D Assets
      floaters.forEach((mesh) => {
        mesh.userData.baseY += mesh.userData.speedY;
        mesh.userData.baseX += Math.sin(elapsed * mesh.userData.driftXSpeed + mesh.userData.phase) * mesh.userData.driftXAmp;

        // Wrap around boundaries
        if (mesh.userData.baseY > 1.35) {
          mesh.userData.baseY = -1.35;
          mesh.userData.baseX = (Math.random() - 0.5) * 2.5;
        }

        // Apply rotation
        mesh.rotation.z += mesh.userData.rotSpeed;

        // Set actual mesh position incorporating mouse parallax scaled by depth
        const parallaxStrength = mesh.position.z * 0.16; // closer assets shift more
        mesh.position.x = mesh.userData.baseX + currentMouseX * parallaxStrength;
        mesh.position.y = mesh.userData.baseY + currentMouseY * parallaxStrength;
      });

      renderer.render(scene, camera);
    };

    animate();

    // ── Cleanup ─────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      quadGeo.dispose();
      quadMaterial.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      
      // Cleanup floaters
      floaters.forEach((mesh) => {
        mesh.material.dispose();
      });
      floaterGeometry.dispose();
      texBalloon.dispose();
      texCake.dispose();
      texGift.dispose();

      renderer.dispose();
    };
  }, [theme]);

  return <canvas ref={containerRef} className="canvas-bg-container" />;
}
