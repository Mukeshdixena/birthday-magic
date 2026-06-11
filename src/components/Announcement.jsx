import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Announcement({ sectionRef, text }) {
  const textRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Split into words for stagger animation
      const words = text.split(" ");
      if (!textRef.current) return;
      textRef.current.innerHTML = words
        .map(
          (w) => `<span class="announce-word" style="display:inline-block;overflow:hidden;margin-right:0.35em"><span style="display:inline-block">${w}</span></span>`
        )
        .join("");

      const innerSpans = textRef.current.querySelectorAll(".announce-word > span");

      gsap.fromTo(
        innerSpans,
        { y: "100%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 0.8,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            once: true,
          },
        }
      );
    });
    return () => ctx.revert();
  }, [text]);

  return (
    <section id="section-announcement" className="chapter-section" ref={sectionRef}>
      <p
        ref={textRef}
        style={{
          fontSize: "clamp(1.8rem, 6vw, 3.5rem)",
          fontWeight: 700,
          textAlign: "center",
          lineHeight: 1.3,
          maxWidth: "85%",
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {text}
      </p>
    </section>
  );
}
