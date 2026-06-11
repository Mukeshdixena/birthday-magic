import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import confetti from "canvas-confetti";
import { CONFIG } from "../config";

gsap.registerPlugin(ScrollTrigger);

export default function WishingCeremony3D({ sectionRef }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [wished, setWished] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // References to keep across renders
  const sceneElements = useRef({
    scene: null,
    camera: null,
    renderer: null,
    cakeGroup: null,
    flames: [],
    pointLights: [],
    smokeParticles: [],
    particleGroup: null,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = containerRef.current.clientWidth || 500;
    const H = containerRef.current.clientHeight || 400;

    // ── 1. Setup Three.js Scene, Camera, Renderer ─────────────────
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 3, 7);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // ── 2. Lights ───────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    // Warm main key light
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Soft cool fill light
    const fillLight = new THREE.DirectionalLight(0xddf0ff, 0.6);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    // Cake group wrapper
    const cakeGroup = new THREE.Group();
    scene.add(cakeGroup);

    // Smoke particles group
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);

    sceneElements.current.scene = scene;
    sceneElements.current.camera = camera;
    sceneElements.current.renderer = renderer;
    sceneElements.current.cakeGroup = cakeGroup;
    sceneElements.current.particleGroup = particleGroup;
    sceneElements.current.flames = [];
    sceneElements.current.pointLights = [];
    sceneElements.current.smokeParticles = [];

    // Helper: Create animated candle flame
    const createFlameMesh = () => {
      const flameGroup = new THREE.Group();

      // Outer orange flame
      const outerGeo = new THREE.ConeGeometry(0.08, 0.22, 10);
      const outerMat = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      const outer = new THREE.Mesh(outerGeo, outerMat);
      outer.position.y = 0.11;
      flameGroup.add(outer);

      // Inner warm core
      const innerGeo = new THREE.ConeGeometry(0.04, 0.14, 10);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0xffdd44,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.position.y = 0.07;
      flameGroup.add(inner);

      // Add a small warm light source
      const light = new THREE.PointLight(0xffaa44, 1.5, 4);
      light.position.y = 0.15;
      flameGroup.add(light);
      sceneElements.current.pointLights.push(light);

      return flameGroup;
    };

    // ── 3. Load OBJ/MTL 3D Cake model ───────────────────────────
    const mtlLoader = new MTLLoader();
    const basePath = "/asets/birthday-cake/birthday-cake_v3_L3.123c45c5c817-3d9f-461e-83bb-8157bffd5569/";
    
    mtlLoader.setPath(basePath);
    mtlLoader.load(
      "10868_birthday-cake_v3.mtl",
      (materials) => {
        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(basePath);
        objLoader.load(
          "10868_birthday-cake_v3.obj",
          (object) => {
            // Center and scale the cake model perfectly using Bounding Box
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            // Reset local pivot to center bottom of the cake
            object.position.x = -center.x;
            object.position.y = -box.min.y; // keep bottom on the floor (y=0)
            object.position.z = -center.z;

            // Group contains the adjusted object
            const cakeWrapper = new THREE.Group();
            cakeWrapper.add(object);
            cakeGroup.add(cakeWrapper);

            // Compute ideal scale to fit viewport (target height around 2.2 units)
            const maxDim = Math.max(size.x, size.y, size.z);
            const scaleFactor = 2.2 / maxDim;
            cakeGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // Rotate object to face standard front (often needs correction depending on original axes)
            cakeWrapper.rotation.x = -Math.PI / 2; // standard Max to WebGL Z-up conversion

            // Traverse meshes to set shadow settings and locate candles
            const candleMeshes = [];
            object.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // Adjust materials to look more polished
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach((m) => {
                  if (m) {
                    m.roughness = 0.45;
                    m.metalness = 0.1;
                  }
                });

                // Find candles
                const isCandle = mats.some(m => 
                  m && m.name && m.name.toLowerCase().includes("candle")
                ) || child.name.toLowerCase().includes("candle");

                if (isCandle) {
                  candleMeshes.push(child);
                }
              }
            });

            // Position flames on top of candles
            if (candleMeshes.length > 0) {
              candleMeshes.forEach((candle) => {
                // Compute candle geometry bounding box to find the top
                if (!candle.geometry.boundingBox) {
                  candle.geometry.computeBoundingBox();
                }
                const localBox = candle.geometry.boundingBox;
                
                // Candle top in local coordinates
                const localFlamePos = new THREE.Vector3(
                  (localBox.max.x + localBox.min.x) / 2,
                  (localBox.max.y + localBox.min.y) / 2,
                  localBox.max.y + 0.1 // extend past the top tip
                );

                const flame = createFlameMesh();
                flame.position.copy(localFlamePos);
                
                // Add the flame as child of candle mesh so it transforms automatically
                candle.add(flame);
                sceneElements.current.flames.push(flame);
              });
            } else {
              // Fallback: If no candle meshes found, create 3 procedural candles and flames
              const fallbackCandleColors = [0x60a5fa, 0xf472b6, 0xfacc15];
              for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2;
                const r = 0.5; // radius from center
                
                const cGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
                const cMat = new THREE.MeshStandardMaterial({ 
                  color: fallbackCandleColors[i],
                  roughness: 0.3 
                });
                const proceduralCandle = new THREE.Mesh(cGeo, cMat);
                
                // Place on the top tier of the cake (approx y=1.2)
                proceduralCandle.position.set(Math.cos(angle) * r, 1.3, Math.sin(angle) * r);
                proceduralCandle.castShadow = true;
                cakeGroup.add(proceduralCandle);

                // Add flame on top
                const flame = createFlameMesh();
                flame.position.set(0, 0.22, 0);
                proceduralCandle.add(flame);
                sceneElements.current.flames.push(flame);
              }
            }

            // Finished loading!
            setLoading(false);
          },
          (xhr) => {
            if (xhr.total > 0) {
              setLoadingProgress(Math.round((xhr.loaded / xhr.total) * 100));
            }
          },
          (err) => {
            console.error("Error loading OBJ model", err);
            setLoading(false); // Hide spinner anyway
          }
        );
      },
      undefined,
      (err) => {
        console.error("Error loading MTL material", err);
        setLoading(false);
      }
    );

    // ── 4. Mouse Interactive Parallax ───────────────────────────
    let targetRX = 0;
    let targetRY = 0;
    let currentRX = 0;
    let currentRY = 0;

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      // target rotation based on mouse
      targetRY = x * 0.45;
      targetRX = y * 0.25;
    };

    containerRef.current.addEventListener("mousemove", onMouseMove);

    // ── 5. Resize handler ───────────────────────────────────────
    const onResize = () => {
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", onResize);

    // ── 6. Animation Loop ────────────────────────────────────────
    let animationFrameId = null;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Slow idle cake rotation
      if (cakeGroup) {
        // Smoothly interpolate mouse rotation (Lerp)
        currentRY += (targetRY - currentRY) * 0.05;
        currentRX += (targetRX - currentRX) * 0.05;

        // Apply mouse tilt + constant rotating spin
        cakeGroup.rotation.y = currentRY + elapsed * 0.18;
        cakeGroup.rotation.x = currentRX;

        // Floating hover motion
        cakeGroup.position.y = 0.1 + Math.sin(elapsed * 1.5) * 0.06;
      }

      // Animate candle flames (flicker & scale)
      const flamesList = sceneElements.current.flames;
      flamesList.forEach((flame, idx) => {
        if (flame.scale.x > 0.01) {
          // Flame micro-scale pulsing
          const pulse = 1.0 + Math.sin(elapsed * 18 + idx) * 0.07 + Math.cos(elapsed * 10 + idx) * 0.04;
          flame.scale.set(pulse, pulse, pulse);

          // Flame slight tilt drift
          flame.rotation.z = Math.sin(elapsed * 6 + idx) * 0.06;
          flame.rotation.x = Math.cos(elapsed * 4 + idx) * 0.04;
        }
      });

      // Animate smoke particles
      const smokeList = sceneElements.current.smokeParticles;
      for (let i = smokeList.length - 1; i >= 0; i--) {
        const p = smokeList[i];
        p.position.add(p.userData.velocity);
        p.userData.velocity.x += (Math.random() - 0.5) * 0.001; // horizontal drift
        
        // Shrink and fade
        p.scale.multiplyScalar(0.95);
        p.material.opacity *= 0.95;

        // Remove dead particles
        if (p.material.opacity < 0.05) {
          particleGroup.remove(p);
          p.geometry.dispose();
          p.material.dispose();
          smokeList.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // ── 7. Scroll entrance trigger ──────────────────────────────
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.75, rotateY: 15 },
        {
          opacity: 1,
          scale: 1,
          rotateY: 0,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            once: true,
          },
        }
      );
    });

    // ── 8. Cleanups ──────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      ctx.revert();
      if (containerRef.current) {
        containerRef.current.removeEventListener("mousemove", onMouseMove);
      }
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  // ── Make a Wish & Blow Out Candles Ceremony ──────────────────
  const blowOutCandles = () => {
    if (wished) return;
    setWished(true);

    const elements = sceneElements.current;
    
    // 1. Extinguish flames and turn off lights
    elements.flames.forEach((flame) => {
      gsap.to(flame.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    });

    elements.pointLights.forEach((light) => {
      gsap.to(light, {
        intensity: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    });

    // 2. Generate smoke particles
    elements.flames.forEach((flame) => {
      // Get the absolute/world position of each flame
      const worldPos = new THREE.Vector3();
      flame.getWorldPosition(worldPos);

      // Spawn 8 smoke particles per flame
      for (let k = 0; k < 8; k++) {
        const sGeo = new THREE.SphereGeometry(Math.random() * 0.03 + 0.015, 6, 6);
        const sMat = new THREE.MeshBasicMaterial({
          color: 0x94a3b8,
          transparent: true,
          opacity: 0.7,
        });
        const p = new THREE.Mesh(sGeo, sMat);
        
        // Initial position at flame tip
        p.position.copy(worldPos);
        p.position.x += (Math.random() - 0.5) * 0.06;
        p.position.z += (Math.random() - 0.5) * 0.06;
        
        // Upward floating velocity
        p.userData = {
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.012,
            Math.random() * 0.018 + 0.012,
            (Math.random() - 0.5) * 0.012
          ),
        };

        elements.particleGroup.add(p);
        elements.smokeParticles.push(p);
      }
    });

    // 3. Play Confetti & Fireworks burst
    const duration = 4000;
    const end = Date.now() + duration;
    const colors = [CONFIG.colors.primary, CONFIG.colors.accent, "#facc15", "#a78bfa", "#f472b6", "#34d399"];

    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors,
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Secondary circular explosion centered at the cake
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.55 },
        colors,
        scale: 1.1,
      });
    }, 350);
  };

  return (
    <section id="section-wishing" className="chapter-section" ref={sectionRef}>
      <div className="glass-panel wishing-panel" style={{ textAlign: "center", maxWidth: "720px", width: "95%" }}>
        
        {!wished ? (
          <h2 className="section-title shimmer-text" style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)" }}>
            Make a Wish... 💫
          </h2>
        ) : (
          <h2 className="section-title shimmer-text" style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)" }}>
            May your wishes come true! 🌟
          </h2>
        )}

        <p style={{ opacity: 0.7, fontSize: "0.95rem", marginBottom: "1.5rem" }}>
          {!wished
            ? "Close your eyes, think of a beautiful dream, and blow out the candles!"
            : `Wishing you a wonderful birthday year ahead filled with happiness, ${CONFIG.name}!`}
        </p>

        {/* 3D WebGL Canvas container */}
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "360px",
            position: "relative",
            margin: "0 auto 1.5rem auto",
            borderRadius: "16px",
            overflow: "hidden",
            background: "radial-gradient(circle at center, rgba(255,255,255,0.02) 0%, transparent 75%)",
          }}
        >
          {loading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                background: "rgba(15, 23, 42, 0.4)",
                backdropFilter: "blur(5px)",
                zIndex: 10,
              }}
            >
              <div className="cake-loader-spinner" />
              <p style={{ fontSize: "0.85rem", opacity: 0.8, letterSpacing: "1px" }}>
                Preparing Birthday Cake... {loadingProgress}%
              </p>
            </div>
          )}

          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              cursor: wished ? "default" : "pointer",
            }}
            onClick={blowOutCandles}
          />
        </div>

        {/* Action button */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          {!wished ? (
            <button className="premium-btn blow-btn" onClick={blowOutCandles} disabled={loading}>
              💨 Blow Out Candles
            </button>
          ) : (
            <div
              style={{
                padding: "0.6rem 2rem",
                borderRadius: "50px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(255, 255, 255, 0.05)",
                fontSize: "0.9rem",
                color: "var(--accent)",
                letterSpacing: "1.5px",
                fontWeight: 500,
                textTransform: "uppercase",
                animation: "pulse-glow 2s infinite ease-in-out",
              }}
            >
              ✨ Wish Made! ✨
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
