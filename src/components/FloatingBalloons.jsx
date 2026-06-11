import React, { useMemo } from "react";

export default function FloatingBalloons() {
  const balloons = useMemo(() => {
    const list = [];
    const count = 20;
    const baseUrl = import.meta.env.BASE_URL || "/";

    for (let i = 0; i < count; i++) {
      const assetIndex = (i % 3) + 1; // Distribute ballon1, ballon2, ballon3
      const size = Math.floor(Math.random() * 45) + 250; // Size between 45px and 90px
      const left = Math.random() * 90 + 5; // Spawning position between 5% and 95% width
      
      // Vertical rise duration and delays
      const duration = Math.random() * 12 + 13; // 13s to 25s
      const delay = Math.random() * -25; // Start animations mid-way so viewport isn't empty on load
      
      // Horizontal sway properties
      const swayDuration = Math.random() * 3 + 9; // 3s to 6s
      const swayXStart = Math.random() * -15 - 10; // -25px to -10px
      const swayXEnd = Math.random() * 15 + 10; // 10px to 25px
      const swayRotStart = Math.random() * -5 - 3; // -8deg to -3deg
      const swayRotEnd = Math.random() * 5 + 3; // 3deg to 8deg
      
      const opacity = Math.random() * 0.35 + 0.45; // Opacity between 0.45 and 0.80

      list.push({
        id: i,
        src: `${baseUrl}img/ballon${assetIndex}.svg`,
        style: {
          left: `${left}%`,
          width: `${size}px`,
          opacity: opacity,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          "--sway-x-start": `${swayXStart}px`,
          "--sway-x-end": `${swayXEnd}px`,
          "--sway-rot-start": `${swayRotStart}deg`,
          "--sway-rot-end": `${swayRotEnd}deg`,
        },
        innerStyle: {
          animationDuration: `${swayDuration}s`,
          animationDelay: `${Math.random() * -6}s`, // Stagger sway phase
        }
      });
    }
    return list;
  }, []);

  return (
    <div className="floating-balloons-container">
      {balloons.map((b) => (
        <div
          key={b.id}
          className="floating-balloon"
          style={b.style}
        >
          <img
            src={b.src}
            alt="Floating Balloon"
            className="floating-balloon-inner"
            style={b.innerStyle}
            draggable="false"
          />
        </div>
      ))}
    </div>
  );
}
