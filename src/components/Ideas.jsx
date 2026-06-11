import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Ideas({ sectionRef, lines = [], bigLetters = "" }) {
  const lineRefs = useRef([]);
  const bigRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          once: true,
        },
      });

      lines.forEach((_, i) => {
        const el = lineRefs.current[i];
        tl.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" })
          .to(el, { opacity: 0, y: -25, duration: 0.4, ease: "power2.in" }, "+=1.4");
      });

      if (bigRef.current) {
        // Big letters bloom in
        const letters = bigRef.current.querySelectorAll(".big-letter");
        tl.fromTo(
          letters,
          { opacity: 0, y: 60, rotateY: -90, transformOrigin: "left center" },
          {
            opacity: 1,
            y: 0,
            rotateY: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "back.out(1.7)",
          }
        ).to(bigRef.current, { opacity: 0, scale: 1.2, duration: 0.6 }, "+=1.5");
      }
    });
    return () => ctx.revert();
  }, [lines, bigLetters]);

  return (
    <section id="section-ideas" className="chapter-section" ref={sectionRef}>
      <div ref={wrapRef} style={{ position: "relative", width: "100%", height: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {lines.map((line, i) => (
          <p
            key={i}
            ref={(el) => (lineRefs.current[i] = el)}
            className="idea-line"
            style={{
              fontSize: "clamp(1.2rem, 3.5vw, 2.2rem)",
              fontWeight: 300,
              textAlign: "center",
              padding: "0 2rem",
              opacity: 0,
              position: "absolute",
              width: "100%",
            }}
            dangerouslySetInnerHTML={{
              __html: line
                .replace(/\*(.*?)\*/g, '<strong style="color:var(--primary);font-weight:600">$1</strong>')
                .replace(/:([^:]+):/g, '<span style="display:inline-block">:$1:</span>'),
            }}
          />
        ))}

        {bigLetters && (
          <div
            ref={bigRef}
            style={{
              position: "absolute",
              opacity: 0,
              lineHeight: 1,
            }}
          >
            {bigLetters.split("").map((ch, i) => (
              <span
                key={i}
                className="big-letter"
                style={{
                  display: "inline-block",
                  fontSize: "clamp(7rem, 22vw, 14rem)",
                  fontWeight: 900,
                  background: "linear-gradient(135deg, var(--primary), var(--accent))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.04em",
                }}
              >
                {ch}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
