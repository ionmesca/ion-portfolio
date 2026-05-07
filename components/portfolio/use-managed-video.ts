"use client";

import { useEffect, useRef } from "react";

const PORTFOLIO_VIDEO_PLAY_EVENT = "ion-portfolio-video-play";

type PortfolioVideoPlayDetail = {
  video: HTMLVideoElement;
};

export function useManagedVideoPlayback(enabled = true) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const currentVideo = video;

    if (!enabled) {
      currentVideo.pause();
      return;
    }

    let isVisible = false;

    function playIfVisible() {
      if (!isVisible) return;
      void currentVideo.play().catch(() => {
        // Autoplay can be blocked by the browser; the poster remains visible.
      });
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        if (isVisible) {
          playIfVisible();
        } else {
          currentVideo.pause();
        }
      },
      { threshold: [0, 0.35, 0.65, 1] }
    );

    function announcePlayback() {
      window.dispatchEvent(
        new CustomEvent<PortfolioVideoPlayDetail>(PORTFOLIO_VIDEO_PLAY_EVENT, {
          detail: { video: currentVideo },
        })
      );
    }

    function pauseForOtherVideo(event: Event) {
      const customEvent = event as CustomEvent<PortfolioVideoPlayDetail>;
      if (customEvent.detail?.video !== currentVideo) {
        currentVideo.pause();
      }
    }

    observer.observe(currentVideo);
    currentVideo.addEventListener("play", announcePlayback);
    window.addEventListener(PORTFOLIO_VIDEO_PLAY_EVENT, pauseForOtherVideo);

    return () => {
      observer.disconnect();
      currentVideo.removeEventListener("play", announcePlayback);
      window.removeEventListener(PORTFOLIO_VIDEO_PLAY_EVENT, pauseForOtherVideo);
    };
  }, [enabled]);

  return videoRef;
}
