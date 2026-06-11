import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Countdown({ sectionRef, from = 3, goText = "🎉" }) {
  const numRefs = useRef([]);
  const goRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          once: true,
        },
      });

      // Animate each countdown number
      for (let i = from; i >= 1; i--) {
        const el = numRefs.current[from - i];
        tl.fromTo(
          el,
          { opacity: 0, scale: 2, y: -30 },
          { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
        ).to(el, { opacity: 0, scale: 0.6, duration: 0.35, ease: "power2.in" }, "+=0.55");
      }

      // GO text
      tl.fromTo(
        goRef.current,
        { opacity: 0, scale: 3 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }
      ).to(goRef.current, { opacity: 0, scale: 0.8, duration: 0.4 }, "+=1.2");
    });
    return () => ctx.revert();
  }, [from]);

  const nums = Array.from({ length: from }, (_, i) => from - i);

  return (
    <section id="section-countdown" className="chapter-section" ref={sectionRef}>
      <div className="countdown-num-wrapper">
        {nums.map((n, i) => (
          <span
            key={n}
            ref={(el) => (numRefs.current[i] = el)}
            style={{
              position: "absolute",
              fontSize: "clamp(6rem, 18vw, 12rem)",
              fontWeight: 800,
              color: "var(--accent)",
              textShadow: "var(--glow-accent)",
              opacity: 0,
              userSelect: "none",
            }}
          >
            {n}
          </span>
        ))}
        <span
          ref={goRef}
          style={{
            position: "absolute",
            fontSize: "clamp(4rem, 14vw, 9rem)",
            opacity: 0,
            userSelect: "none",
          }}
        >
          {goText}
        </span>
      </div>
    </section>
  );
}
