import { useEffect, useState } from 'react';

export default function Marquee() {
  const content = "🎉 LIVE EVENTS • 🎤 CONCERTS • 💃 DANCE SHOWS • 🪩 DJ NIGHTS • 🎸 ROCK FESTS • 🎭 CULTURAL EVENTS • 🎟️ BOOK NOW • ✨ EXPERIENCE THE MAGIC • 🔥";

  return (
    <div className="marquee-container interactive-marquee">
      <div className="marquee-fade-left"></div>
      <div className="marquee">
        <div className="marquee-track">
          <span>{content}</span>
          <span>&nbsp;&nbsp;&nbsp;{content}</span>
          <span>&nbsp;&nbsp;&nbsp;{content}</span>
          <span>&nbsp;&nbsp;&nbsp;{content}</span>
        </div>
      </div>
      <div className="marquee-fade-right"></div>
    </div>
  );
}
