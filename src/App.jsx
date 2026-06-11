import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Swal from "sweetalert2";

import Background3D from "./components/Background3D";
import ScrollNav from "./components/ScrollNav";
import ScrollHint from "./components/ScrollHint";
import Hero from "./components/Hero";
import Countdown from "./components/Countdown";
import Announcement from "./components/Announcement";
import Chatbox from "./components/Chatbox";
import Ideas from "./components/Ideas";
import Quote from "./components/Quote";
import MemoryGallery from "./components/MemoryGallery";
import Profile from "./components/Profile";
import GiftBox3D from "./components/GiftBox3D";
import WishingCeremony3D from "./components/WishingCeremony3D";
import Celebration from "./components/Celebration";

import { CONFIG } from "./config";

gsap.registerPlugin(ScrollTrigger);

// Navigation labels for each section
const NAV_SECTIONS = [
  { id: "section-hero",         label: "Welcome" },
  { id: "section-countdown",    label: "Countdown" },
  { id: "section-announcement", label: "Announcement" },
  { id: "section-chatbox",      label: "Message" },
  { id: "section-ideas",        label: "Story" },
  { id: "section-quote",        label: "Quote" },
  { id: "section-gallery",      label: "Memories" },
  { id: "section-profile",      label: "Profile" },
  { id: "section-giftbox",      label: "Gift" },
  { id: "section-wishing",      label: "Wish" },
  { id: "section-celebration",  label: "Celebrate" },
];

export default function App() {
  const [theme, setTheme] = useState(CONFIG.defaultMode || "dark");
  const [activeSection, setActiveSection] = useState(0);
  const audioRef = useRef(null);

  // Section refs
  const refs = {
    hero:         useRef(null),
    countdown:    useRef(null),
    announcement: useRef(null),
    chatbox:      useRef(null),
    ideas:        useRef(null),
    quote:        useRef(null),
    gallery:      useRef(null),
    profile:      useRef(null),
    giftbox:      useRef(null),
    wishing:      useRef(null),
    celebration:  useRef(null),
  };

  const refArray = [
    refs.hero, refs.countdown, refs.announcement, refs.chatbox,
    refs.ideas, refs.quote, refs.gallery, refs.profile,
    refs.giftbox, refs.wishing, refs.celebration,
  ];

  // ── Theme ─────────────────────────────────────────────────────
  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    document.documentElement.classList.toggle("light-theme", theme === "light");
  }, [theme]);

  // ── ScrollTrigger: track active section ───────────────────────
  useEffect(() => {
    const triggers = refArray.map((ref, idx) => {
      if (!ref.current) return null;
      return ScrollTrigger.create({
        trigger: ref.current,
        start: "top center",
        end: "bottom center",
        onEnter: () => setActiveSection(idx),
        onEnterBack: () => setActiveSection(idx),
      });
    });

    return () => triggers.forEach((t) => t?.kill());
  }, []);

  // ── Nav dot click → smooth scroll ────────────────────────────
  const handleDotClick = (idx) => {
    const ref = refArray[idx];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ── Music prompt ──────────────────────────────────────────────
  useEffect(() => {
    if (!CONFIG.music) return;

    // Create hidden audio element
    const audio = new Audio(CONFIG.music);
    audio.loop = true;
    audio.volume = 0.7;
    audioRef.current = audio;

    const isLight = theme === "light";

    Swal.fire({
      title: "🎵 Play birthday music?",
      html: "<p style='opacity:0.7;font-size:0.95rem'>Set the mood for this experience</p>",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, play it!",
      cancelButtonText: "No thanks",
      background: isLight ? "#fafaf9" : "#0f172a",
      color: isLight ? "#1e293b" : "#f1f5f9",
      confirmButtonColor: CONFIG.colors.accent,
      cancelButtonColor: "#64748b",
    }).then((res) => {
      if (res.isConfirmed) {
        audio.play().catch(() => {});
      }
    });

    return () => {
      audio.pause();
    };
  }, []);

  // ── Find sections from CONFIG ─────────────────────────────────
  const cfg = CONFIG.sections;
  const findSection = (type) => cfg.find((s) => s.type === type) || {};

  const greetingSection     = findSection("greeting");
  const countdownSection    = findSection("countdown");
  const announcementSection = findSection("announcement");
  const chatboxSection      = findSection("chatbox");
  const ideasSection        = findSection("ideas");
  const quoteSection        = findSection("quote");
  const profileSection      = findSection("profile");
  const giftboxSection      = findSection("giftbox");
  const closingSection      = findSection("closing");

  return (
    <>
      {/* Fixed 3D animated background */}
      <Background3D theme={theme} />

      {/* Fixed scroll navigation dots */}
      <ScrollNav
        sections={NAV_SECTIONS}
        activeIndex={activeSection}
        onDotClick={handleDotClick}
      />

      {/* Intelligent scroll hint */}
      <ScrollHint />

      {/* Theme Toggle Button */}
      <button id="theme-toggle" onClick={toggleTheme} title="Toggle dark/light mode">
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      {/* ── Scroll Journey ──────────────────────────────────── */}
      <main>

        {/* 1. Hero */}
        <Hero sectionRef={refs.hero} />

        {/* 2. Countdown */}
        <Countdown
          sectionRef={refs.countdown}
          from={countdownSection.from || 3}
          goText={countdownSection.goText || "🎉"}
        />

        {/* 3. Announcement */}
        <Announcement
          sectionRef={refs.announcement}
          text={announcementSection.text || "It's your birthday!! 🎂"}
        />

        {/* 4. Chatbox */}
        <Chatbox
          sectionRef={refs.chatbox}
          message={chatboxSection.message || "Happy birthday!"}
          buttonText={chatboxSection.buttonText || "Send"}
        />

        {/* 5. Ideas */}
        <Ideas
          sectionRef={refs.ideas}
          lines={ideasSection.lines || []}
          bigLetters={ideasSection.bigLetters || "SO"}
        />

        {/* 6. Quote */}
        <Quote
          sectionRef={refs.quote}
          text={quoteSection.text || ""}
          author={quoteSection.author}
        />

        {/* 7. Memory Gallery — add image URLs to the images array to show real photos */}
        <MemoryGallery
          sectionRef={refs.gallery}
          images={[]}
        />

        {/* 8. Profile */}
        <Profile
          sectionRef={refs.profile}
          wishTitle={profileSection.wishTitle || "Happy Birthday!"}
          wishText={profileSection.wishText || ""}
        />

        {/* 9. Gift Box */}
        <GiftBox3D
          sectionRef={refs.giftbox}
          title={giftboxSection.title || "A Tiny Surprise For You"}
          message={giftboxSection.message || "Wishing you a wonderful birthday!"}
        />

        {/* 9b. Wishing Ceremony */}
        <WishingCeremony3D
          sectionRef={refs.wishing}
        />

        {/* 10. Final Celebration */}
        <Celebration
          sectionRef={refs.celebration}
          closingText={closingSection.text || "Thank you for being you."}
          replayText={closingSection.replayText || "Watch it again?"}
          audioRef={audioRef}
        />
      </main>
    </>
  );
}
