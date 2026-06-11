import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Quote({ sectionRef, text, author }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const card = cardRef.current;
      const children = card.querySelectorAll(".quote-reveal-item");

      gsap.fromTo(
        card,
        { opacity: 0, y: 50, rotateX: -15, transformOrigin: "top center" },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 65%", once: true },
        }
      );

      gsap.fromTo(
        children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 65%", once: true },
          delay: 0.3,
        }
      );
    });
    return () => ctx.revert();
  }, []);

  // 3D tilt on mouse move
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotateY: x * 12,
      rotateX: -y * 8,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 800,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.6)",
    });
  };

  return (
    <section id="section-quote" className="chapter-section" ref={sectionRef}>
      <div
        ref={cardRef}
        className="glass-panel"
        style={{ opacity: 0, transformStyle: "preserve-3d", cursor: "default" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="quote-wrapper">
          <span className="quote-symbol quote-reveal-item">"</span>
          <p className="quote-text quote-reveal-item">{text}</p>
          {author && (
            <p className="quote-author quote-reveal-item">— {author}</p>
          )}
        </div>
      </div>
    </section>
  );
}
