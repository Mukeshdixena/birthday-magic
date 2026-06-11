import React, { useState, useEffect, useRef } from "react";

export default function ScrollHint() {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef(null);

  const resetTimer = () => {
    setIsVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Set 3 seconds timer
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 3000);
  };

  useEffect(() => {
    // Add event listeners for interaction
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("touchmove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    // Initial timer start
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("touchmove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);

  return (
    <div className={`scroll-hint-wrapper ${isVisible ? "visible" : ""}`}>
      <div className="scroll-hint-panel">
        <div className="scroll-hint-line-container">
          <div className="scroll-hint-dot" />
        </div>
        <span className="scroll-hint-text">Scroll to continue</span>
      </div>
    </div>
  );
}
