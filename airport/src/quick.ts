// Script for the Quick view and article pages: plays a project clip only while it is on screen,
// and only when the visitor allows motion.
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

function setUp() {
  const clips = document.querySelectorAll<HTMLVideoElement>('video.case-clip');
  if (reduced.matches) {
    clips.forEach(video => (video.controls = true));
    return;
  }
  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          video.preload = 'auto';
          // A blocked autoplay leaves the poster visible; offer the controls instead.
          video.play().catch(() => (video.controls = true));
        } else video.pause();
      }
    },
    { threshold: 0.4 },
  );
  clips.forEach(video => observer.observe(video));
}

setUp();
