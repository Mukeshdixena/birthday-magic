import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Chatbox({ sectionRef, message, buttonText = "Send" }) {
  const cardRef = useRef(null);
  const textRef = useRef(null);
  const btnRef = useRef(null);
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // Card entrance on scroll
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            once: true,
            onEnter: () => startTyping(),
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const startTyping = () => {
    if (started) return;
    setStarted(true);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(message.slice(0, i));
      if (i >= message.length) {
        clearInterval(interval);
        // Animate send button in
        gsap.fromTo(
          btnRef.current,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
        );
      }
    }, 28);
  };

  // Magnetic button effect
  const handleBtnMouseMove = (e) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
  };

  const handleBtnMouseLeave = () => {
    gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <section id="section-chatbox" className="chapter-section" ref={sectionRef}>
      <div ref={cardRef} className="glass-panel" style={{ opacity: 0 }}>
        <div className="chat-container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.25rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid var(--panel-border)",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "var(--primary)",
                boxShadow: "var(--glow-primary)",
                animation: "pulse-dot 2s ease-in-out infinite",
              }}
            />
            <span style={{ fontSize: "0.85rem", opacity: 0.6, letterSpacing: "1px" }}>
              typing a message…
            </span>
          </div>

          <p className="chat-bubble" style={{ minHeight: "5rem" }}>
            {typed}
            {typed.length < message.length && (
              <span
                style={{
                  display: "inline-block",
                  width: "2px",
                  height: "1.1em",
                  background: "var(--primary)",
                  marginLeft: "2px",
                  verticalAlign: "middle",
                  animation: "blink 0.7s step-end infinite",
                }}
              />
            )}
          </p>

          <div className="chat-footer">
            <button
              ref={btnRef}
              className="premium-btn"
              style={{ opacity: 0 }}
              onMouseMove={handleBtnMouseMove}
              onMouseLeave={handleBtnMouseLeave}
            >
              {buttonText} ✉️
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.7} }
      `}</style>
    </section>
  );
}
