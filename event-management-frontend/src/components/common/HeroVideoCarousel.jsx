import { useEffect, useState } from 'react';
import { HERO_VIDEOS } from '../../config/mediaConfig.js';

export default function HeroVideoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Always attempt to render — defer to browser to decide whether it can play
  useEffect(() => {
    // Small delay so the first paint isn't blocked by video decode
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Cycle through videos every 8 seconds
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_VIDEOS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [loaded]);

  if (!loaded) return null;

  return (
    <div className="hero-video-container" aria-hidden="true">
      {HERO_VIDEOS.map((src, index) => {
        const isActive = index === activeIndex;
        const isNear = index === activeIndex || index === (activeIndex + 1) % HERO_VIDEOS.length;

        return (
          <video
            key={src}
            className={`hero-video${isActive ? ' hero-video--active' : ''}`}
            src={isNear ? src : undefined}
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
          />
        );
      })}
      {/* Dark vignette so text stays legible */}
      <div className="hero-video-overlay" />
    </div>
  );
}
