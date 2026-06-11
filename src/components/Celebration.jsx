import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import confetti from "canvas-confetti";
import { CONFIG } from "../config";

gsap.registerPlugin(ScrollTrigger);

export default function Celebration({ sectionRef, closingText, replayText, onReplay, audioRef }) {
  const wrapRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [fireworksDone, setFireworksDone] = useState(false);
  const fireworksRaf = useRef(null);
  const balloonsRef = useRef(null);

  // Launch fireworks
  const launchFireworks = useCallback(() => {
    const duration = 5000;
    const end = Date.now() + duration;
    const colors = [CONFIG.colors.primary, CONFIG.colors.accent, "#facc15", "#34d399", "#f472b6", "#818cf8"];

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors,
        shapes: ["circle", "square"],
        ticks: 200,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors,
        shapes: ["circle", "square"],
        ticks: 200,
      });

      if (Date.now() < end) {
        fireworksRaf.current = requestAnimationFrame(frame);
      } else {
        setFireworksDone(true);
      }
    };

    fireworksRaf.current = requestAnimationFrame(frame);
  }, []);

  // Balloon float animation
  const spawnBalloons = useCallback(() => {
    if (!balloonsRef.current) return;
    const emojis = ["🎈", "🎉", "🎊", "🥳", "💖", "✨", "🌟", "🎁"];
    const count = 18;

    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.cssText = `
        position:absolute;
        font-size:${Math.random() * 1.8 + 1.5}rem;
        left:${Math.random() * 100}%;
        bottom:-60px;
        opacity:0;
        pointer-events:none;
        user-select:none;
        filter:drop-shadow(0 4px 6px rgba(0,0,0,0.2));
      `;
      balloonsRef.current.appendChild(el);

      gsap.fromTo(
        el,
        { y: 0, opacity: 0, rotation: Math.random() * 20 - 10 },
        {
          y: -(window.innerHeight + 120),
          opacity: 1,
          rotation: Math.random() * 30 - 15,
          duration: Math.random() * 5 + 4,
          delay: Math.random() * 3,
          ease: "power1.out",
          onComplete: () => el.remove(),
        }
      );
    }
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrapRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            once: true,
            onEnter: () => {
              launchFireworks();
              spawnBalloons();
            },
          },
        }
      );

      gsap.fromTo(
        wrapRef.current?.querySelectorAll(".celeb-item"),
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.18,
          duration: 0.85,
          ease: "back.out(1.6)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            once: true,
          },
          delay: 0.3,
        }
      );
    });

    return () => {
      ctx.revert();
      cancelAnimationFrame(fireworksRaf.current);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef?.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef?.current) audioRef.current.volume = val;
  };

  const handleReplay = () => {
    if (onReplay) onReplay();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section id="section-celebration" className="chapter-section" ref={sectionRef} style={{ minHeight: "100vh" }}>
      {/* Balloon container (absolutely positioned) */}
      <div
        ref={balloonsRef}
        style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}
      />

      <div
        ref={wrapRef}
        className="celebration-wrapper"
        style={{ opacity: 0, position: "relative", zIndex: 2 }}
      >
        {/* Main closing text */}
        <div className="glass-panel celeb-item" style={{ textAlign: "center", gap: "1.5rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>🎂</div>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
              fontWeight: 700,
              background: "linear-gradient(135deg, var(--primary), var(--accent))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "1rem",
            }}
          >
            Happy Birthday, {CONFIG.name}! 🎉
          </h2>
          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
              fontWeight: 300,
              opacity: 0.75,
              lineHeight: 1.8,
              maxWidth: "500px",
            }}
          >
            {closingText}
          </p>
        </div>

        {/* Music controls */}
        <div className="music-control-panel celeb-item">
          <span className="music-status-text">{playing ? "♪ Now Playing" : "Birthday Song"}</span>
          <div className="music-main-row">
            <button className="music-btn" onClick={togglePlay} title={playing ? "Pause" : "Play"}>
              {playing ? "⏸" : "▶"}
            </button>
            <input
              className="music-vol-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              title="Volume"
            />
            <span style={{ fontSize: "0.85rem", opacity: 0.5 }}>
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Replay button */}
        <div className="celeb-item" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem" }}>
          <p style={{ fontSize: "0.95rem", opacity: 0.55 }}>{replayText}</p>
          <button id="replay" className="premium-btn" onClick={handleReplay} style={{ fontSize: "1rem" }}>
            ↺ Replay Journey
          </button>
        </div>
      </div>
    </section>
  );
}
