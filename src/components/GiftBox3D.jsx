import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import confetti from "canvas-confetti";
import { CONFIG } from "../config";

gsap.registerPlugin(ScrollTrigger);

export default function GiftBox3D({ sectionRef, title, message }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef({});
  const [opened, setOpened] = useState(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Scene Setup ─────────────────────────────────────────────
    const W = canvas.clientWidth || 400;
    const H = canvas.clientHeight || 300;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 2.5, 7);
    camera.lookAt(0, 0.5, 0);

    // ── Lights ──────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const spotLight = new THREE.SpotLight(0xffffff, 2.5, 20, Math.PI / 5, 0.3);
    spotLight.position.set(3, 8, 5);
    spotLight.castShadow = true;
    scene.add(spotLight);
    const pointLight = new THREE.PointLight(CONFIG.colors.primary.replace("#", "0x").replace(/^0x/, "0x"), 1, 10);
    scene.add(pointLight);

    // ── Materials ────────────────────────────────────────────────
    const boxMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(CONFIG.colors.primary),
      roughness: 0.3,
      metalness: 0.15,
    });
    const lidMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(CONFIG.colors.primary),
      roughness: 0.2,
      metalness: 0.2,
    });
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(CONFIG.colors.accent),
      roughness: 0.4,
      metalness: 0.3,
    });
    const bowMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(CONFIG.colors.accent),
      roughness: 0.3,
      metalness: 0.3,
    });

    // ── Box Base ─────────────────────────────────────────────────
    const baseGeo = new THREE.BoxGeometry(2, 1.5, 2);
    const base = new THREE.Mesh(baseGeo, boxMat);
    base.position.y = 0.75;
    base.castShadow = true;
    base.receiveShadow = true;
    scene.add(base);

    // Ribbon stripes on base
    const ribbonVGeo = new THREE.BoxGeometry(0.18, 1.51, 2.01);
    const ribbonV = new THREE.Mesh(ribbonVGeo, ribbonMat);
    ribbonV.position.y = 0.75;
    scene.add(ribbonV);

    const ribbonHGeo = new THREE.BoxGeometry(2.01, 1.51, 0.18);
    const ribbonH = new THREE.Mesh(ribbonHGeo, ribbonMat);
    ribbonH.position.y = 0.75;
    scene.add(ribbonH);

    // ── Lid Group (for rotation animation) ─────────────────────
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 1.5, -1); // pivot at back edge
    scene.add(lidGroup);

    const lidGeo = new THREE.BoxGeometry(2.1, 0.35, 2.1);
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.set(0, 0, 1); // offset from pivot
    lid.castShadow = true;
    lidGroup.add(lid);

    // Lid ribbon
    const lidRibbonVGeo = new THREE.BoxGeometry(0.18, 0.36, 2.11);
    const lidRibbonV = new THREE.Mesh(lidRibbonVGeo, ribbonMat);
    lidRibbonV.position.set(0, 0, 1);
    lidGroup.add(lidRibbonV);

    const lidRibbonHGeo = new THREE.BoxGeometry(2.11, 0.36, 0.18);
    const lidRibbonH = new THREE.Mesh(lidRibbonHGeo, ribbonMat);
    lidRibbonH.position.set(0, 0, 1);
    lidGroup.add(lidRibbonH);

    // ── Bow (Torus loops) ────────────────────────────────────────
    const bowGeo1 = new THREE.TorusGeometry(0.28, 0.07, 8, 20);
    const bow1 = new THREE.Mesh(bowGeo1, bowMat);
    bow1.rotation.z = Math.PI / 4;
    bow1.position.set(-0.28, 0.24, 1);
    lidGroup.add(bow1);

    const bow2 = bow1.clone();
    bow2.rotation.z = -Math.PI / 4;
    bow2.position.set(0.28, 0.24, 1);
    lidGroup.add(bow2);

    const bowCenterGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const bowCenter = new THREE.Mesh(bowCenterGeo, bowMat);
    bowCenter.position.set(0, 0.18, 1);
    lidGroup.add(bowCenter);

    // Shadow plane
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.3 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // ── Store references ─────────────────────────────────────────
    sceneRef.current = { renderer, scene, camera, lidGroup, base };

    // ── Mouse hover tilt ─────────────────────────────────────────
    let targetRX = 0, targetRY = 0;
    let currentRX = 0, currentRY = 0;
    const onMouseMove = (e) => {
      if (opened) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRY = x * 0.4;
      targetRX = -y * 0.25;
    };
    canvas.addEventListener("mousemove", onMouseMove);

    // ── Resize ──────────────────────────────────────────────────
    const onResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ── Animate loop ─────────────────────────────────────────────
    let raf;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Floating bob
      base.position.y = 0.75 + Math.sin(t * 1.2) * 0.04;
      lidGroup.position.y = Math.sin(t * 1.2) * 0.04;

      // Smooth rotate follow
      currentRX += (targetRX - currentRX) * 0.06;
      currentRY += (targetRY - currentRY) * 0.06;
      scene.rotation.x = currentRX;
      scene.rotation.y = currentRY + Math.sin(t * 0.3) * 0.08;

      // Pulsing point light
      pointLight.intensity = 0.8 + Math.sin(t * 2) * 0.4;
      pointLight.position.set(Math.sin(t * 0.7) * 3, 3, Math.cos(t * 0.7) * 3);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  // Scroll entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        canvasRef.current?.parentElement,
        { opacity: 0, scale: 0.6, rotateY: -20 },
        {
          opacity: 1,
          scale: 1,
          rotateY: 0,
          duration: 1.4,
          ease: "elastic.out(1, 0.65)",
          scrollTrigger: { trigger: sectionRef.current, start: "top 65%", once: true },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const openGift = () => {
    if (opened) return;
    setOpened(true);

    const { lidGroup, scene } = sceneRef.current;
    if (!lidGroup) return;

    // Shake sequence
    const shakeTl = gsap.timeline();
    shakeTl
      .to(scene.rotation, { y: 0.5, duration: 0.1, ease: "power1.inOut" })
      .to(scene.rotation, { y: -0.5, duration: 0.15, ease: "power1.inOut" })
      .to(scene.rotation, { y: 0.3, duration: 0.12, ease: "power1.inOut" })
      .to(scene.rotation, { y: -0.3, duration: 0.12, ease: "power1.inOut" })
      .to(scene.rotation, { y: 0, duration: 0.1, ease: "power1.inOut" })
      .then(() => {
        // Pop lid off
        gsap.to(lidGroup.rotation, {
          x: -Math.PI * 1.1,
          duration: 0.9,
          ease: "power3.out",
        });
        gsap.to(lidGroup.position, {
          y: 4,
          x: 1.5,
          z: -2,
          duration: 0.9,
          ease: "power3.out",
        });

        // Confetti burst
        const myConfetti = confetti.create(undefined, { resize: true, useWorker: true });
        myConfetti({
          particleCount: 160,
          spread: 90,
          origin: { y: 0.55, x: 0.5 },
          colors: [CONFIG.colors.primary, CONFIG.colors.accent, "#facc15", "#34d399", "#f472b6"],
          startVelocity: 50,
          ticks: 200,
          shapes: ["circle", "square"],
        });

        // Show surprise card
        setTimeout(() => setShowCard(true), 500);
      });
  };

  return (
    <section id="section-giftbox" className="chapter-section" ref={sectionRef}>
      <h2
        className="section-title"
        style={{ marginBottom: "2rem" }}
      >
        {title || "A Tiny Surprise For You 🎁"}
      </h2>

      {!showCard ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
            perspective: "1000px",
          }}
        >
          <div
            style={{
              width: "min(420px, 90vw)",
              height: "320px",
              opacity: 0,
              cursor: opened ? "default" : "pointer",
            }}
            onClick={openGift}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                borderRadius: "16px",
              }}
              width={420}
              height={320}
            />
          </div>

          {!opened && (
            <p
              className="giftbox-label"
              style={{
                color: "var(--text)",
                fontSize: "0.85rem",
                opacity: 0.5,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Click the gift to open ✨
            </p>
          )}
        </div>
      ) : (
        <div
          className="glass-panel surprise-reveal-card"
          style={{
            animation: "surprise-in 0.7s cubic-bezier(0.175,0.885,0.32,1.275) both",
          }}
        >
          <div style={{ fontSize: "3.5rem" }}>🎉</div>
          <h3 className="surprise-title">For {CONFIG.name} 💖</h3>
          <p className="surprise-message">{message || "Wishing you a wonderful birthday!"}</p>
          <p className="surprise-hint">Scroll down to continue ↓</p>
        </div>
      )}

      <style>{`
        @keyframes surprise-in {
          from { opacity:0; transform: scale(0.6) translateY(40px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </section>
  );
}
