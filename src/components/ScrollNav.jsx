import React from "react";

export default function ScrollNav({ sections, activeIndex, onDotClick }) {
  return (
    <div className="scroll-nav-container">
      {sections.map((section, idx) => {
        const isActive = idx === activeIndex;
        return (
          <div
            key={section.id}
            className={`scroll-nav-dot-wrap ${isActive ? "active" : ""}`}
            onClick={() => onDotClick(idx)}
            title={section.label}
          >
            <span className="scroll-nav-label">{section.label}</span>
            <div className="scroll-nav-dot" />
          </div>
        );
      })}
    </div>
  );
}
