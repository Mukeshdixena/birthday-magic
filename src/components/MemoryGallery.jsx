import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CONFIG } from "../config";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_MEMORIES = [
  {
    type: "photo",
    src: CONFIG.photo || "./img/irene.jpg",
    caption: "A Beautiful Smile 💖",
  },
  {
    type: "gradient",
    gradient: "linear-gradient(135deg, #f472b6 0%, #c084fc 100%)",
    emoji: "🌸",
    caption: "Warm Smiles ✨",
  },
  {
    type: "gradient",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)",
    emoji: "🎈",
    caption: "Sweet Adventures 🎈",
  },
  {
    type: "gradient",
    gradient: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
    emoji: "💫",
    caption: "Chasing Dreams 💫",
  },
  {
    type: "gradient",
    gradient: "linear-gradient(135deg, #fb923c 0%, #f472b6 100%)",
    emoji: "🌙",
    caption: "Happy Moments 🌸",
  },
];

export default function MemoryGallery({ sectionRef, images = [] }) {
  const cardRefs = useRef([]);
  const titleRef = useRef(null);

  // Use provided images if available, otherwise fallback to our premium default memories
  const items = images.length > 0 ? images : DEFAULT_MEMORIES;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title reveal
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: -30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
        }
      );

      // Staggered card reveal
      gsap.fromTo(
        cardRefs.current,
        { opacity: 0, y: 80, rotateY: (i) => (i % 2 === 0 ? 30 : -30), scale: 0.85 },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          scale: 1,
          duration: 1.2,
          stagger: 0.12,
          ease: "back.out(1.3)",
          scrollTrigger: { trigger: sectionRef.current, start: "top 65%", once: true },
          delay: 0.2,
        }
      );

      // Scroll depth parallax (each card at different speed)
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const dir = i % 2 === 0 ? -30 : 30;
        gsap.fromTo(
          card,
          { y: dir },
          {
            y: -dir,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.5,
            },
          }
        );
      });
    });
    return () => ctx.revert();
  }, [sectionRef]);

  // 3D tilt on mouse
  const handleMouseMove = (e, idx) => {
    const card = cardRefs.current[idx];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotateY: x * 20,
      rotateX: -y * 16,
      boxShadow: `${-x * 15}px ${-y * 15}px 35px rgba(0,0,0,0.35), var(--glow-primary)`,
      duration: 0.35,
      ease: "power2.out",
      transformPerspective: 800,
    });
  };

  const handleMouseLeave = (idx) => {
    gsap.to(cardRefs.current[idx], {
      rotateY: 0,
      rotateX: 0,
      boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    });
  };

  return (
    <section id="section-gallery" className="chapter-section" ref={sectionRef} style={{ minHeight: "100vh" }}>
      <h2
        ref={titleRef}
        className="section-title"
        style={{ opacity: 0, marginBottom: "2rem" }}
      >
        Beautiful Memories ✨
      </h2>

      <div className="gallery-wrapper">
        {items.map((item, i) => {
          const isGradient = item.type === "gradient";
          const caption = typeof item === "string" ? `Memory #${i+1}` : item.caption;

          return (
            <div
              key={i}
              ref={(el) => (cardRefs.current[i] = el)}
              className="gallery-card"
              style={{ opacity: 0 }}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={() => handleMouseLeave(i)}
            >
              <div className="gallery-image-box" style={{ background: isGradient ? item.gradient : "#1e293b" }}>
                {isGradient ? (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "3rem",
                    }}
                  >
                    {item.emoji}
                  </div>
                ) : (
                  <img
                    className="gallery-img"
                    src={typeof item === "string" ? item : item.src}
                    alt={caption}
                    loading="lazy"
                  />
                )}
              </div>
              <p className="gallery-desc">{caption}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
