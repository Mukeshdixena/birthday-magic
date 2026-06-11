import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CONFIG } from "../config";

gsap.registerPlugin(ScrollTrigger);

export default function Profile({ sectionRef, wishTitle, wishText }) {
  const avatarRef = useRef(null);
  const textRef = useRef(null);
  const sectionEl = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          once: true,
        },
      });

      tl.fromTo(
        avatarRef.current,
        { scale: 0, opacity: 0, rotateY: -180 },
        { scale: 1, opacity: 1, rotateY: 0, duration: 1.2, ease: "back.out(1.5)" }
      ).fromTo(
        textRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.18, ease: "power3.out" },
        "-=0.6"
      );
    });
    return () => ctx.revert();
  }, []);

  // Avatar mouse rotate
  const handleAvatarMouseMove = (e) => {
    const el = avatarRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(el, { rotateY: x * 20, rotateX: -y * 15, duration: 0.4, ease: "power2.out", transformPerspective: 600 });
  };

  const handleAvatarMouseLeave = () => {
    gsap.to(avatarRef.current, { rotateY: 0, rotateX: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" });
  };

  // Wish title letter split
  const letters = wishTitle.split("").map((ch, i) => (
    <span
      key={i}
      style={{
        display: "inline-block",
        background: "linear-gradient(135deg, var(--primary), var(--accent))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {ch === " " ? "\u00A0" : ch}
    </span>
  ));

  return (
    <section id="section-profile" className="chapter-section" ref={sectionRef}>
      <div className="profile-card">
        <div
          ref={avatarRef}
          className="profile-avatar-wrapper"
          style={{ opacity: 0, cursor: "pointer" }}
          onMouseMove={handleAvatarMouseMove}
          onMouseLeave={handleAvatarMouseLeave}
        >
          <img
            src={CONFIG.photo}
            alt={CONFIG.name}
            className="profile-avatar"
            loading="lazy"
          />
        </div>

        <div ref={textRef}>
          <h2 className="profile-wish-title">{letters}</h2>
          <p className="profile-wish-text" style={{ maxWidth: "480px" }}>{wishText}</p>
        </div>
      </div>
    </section>
  );
}
