import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CONFIG } from "../config";

export default function Hero({ sectionRef }) {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const spotlightRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.5 });

    // Spotlight grow in
    tl.fromTo(
      spotlightRef.current,
      { opacity: 0, scale: 0.6 },
      { opacity: 1, scale: 1, duration: 2.2, ease: "power3.out" }
    );

    // Letter stagger reveal
    const letters = titleRef.current?.querySelectorAll(".hero-letter");
    if (letters?.length) {
      tl.fromTo(
        letters,
        { y: 80, opacity: 0, rotateX: -90, transformOrigin: "bottom center" },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.9,
          stagger: 0.05,
          ease: "back.out(1.7)",
        },
        "-=1.6"
      );
    }

    // Hi text
    tl.fromTo(
      subtitleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.4"
    );

    // Slow zoom-in camera effect on wrapper
    tl.fromTo(
      wrapperRef.current,
      { scale: 0.92 },
      { scale: 1, duration: 3, ease: "power1.out" },
      0
    );
  }, []);

  // Mouse parallax spotlight
  useEffect(() => {
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          x,
          y,
          duration: 1.5,
          ease: "power2.out",
        });
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const nameParts = CONFIG.name.toUpperCase().split("");

  return (
    <section
      id="section-hero"
      className="chapter-section"
      ref={sectionRef}
      style={{ minHeight: "100vh", overflow: "hidden" }}
    >
      {/* Radial spotlight */}
      <div
        ref={spotlightRef}
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(244,114,182,0.12) 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        ref={wrapperRef}
        className="hero-greeting"
        style={{ position: "relative", zIndex: 2, perspective: "1200px" }}
      >
        {/* Subtext */}
        <p
          ref={subtitleRef}
          style={{
            fontSize: "clamp(0.9rem, 2.5vw, 1.2rem)",
            fontWeight: 300,
            letterSpacing: "4px",
            textTransform: "uppercase",
            opacity: 0.55,
            marginBottom: "1.5rem",
          }}
        >
          A Birthday Story
        </p>

        {/* Big animated name */}
        <h1 className="hero-name-reveal" ref={titleRef} style={{ perspective: "800px" }}>
          {"Hi ".split("").map((ch, i) => (
            <span
              key={`hi-${i}`}
              className="hero-letter"
              style={{
                display: "inline-block",
                color: "var(--text)",
                fontSize: "clamp(2rem, 5vw, 3rem)",
                letterSpacing: "1px",
              }}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
          {nameParts.map((ch, i) => (
            <span key={`name-${i}`} className="hero-letter hero-name-letter">
              {ch}
            </span>
          ))}
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 3vw, 1.4rem)",
            fontWeight: 300,
            opacity: 0.65,
            marginTop: "1.5rem",
          }}
        >
          I really like your name btw!
        </p>

        {/* Depth badge */}
        <div
          style={{
            marginTop: "3rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            padding: "0.6rem 1.5rem",
            borderRadius: "50px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(12px)",
            fontSize: "0.8rem",
            letterSpacing: "3px",
            textTransform: "uppercase",
            opacity: 0.7,
          }}
        >
          <span style={{ color: "var(--primary)" }}>✦</span>
          Scroll to Begin
          <span style={{ color: "var(--accent)" }}>✦</span>
        </div>
      </div>
    </section>
  );
}
