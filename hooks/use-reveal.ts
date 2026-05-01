"use client";

import { useEffect, useRef, useState } from "react";

interface UseRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useReveal({
  threshold = 0.1,
  rootMargin = "0px",
  triggerOnce = true,
}: UseRevealOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          element.classList.add("visible");
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
          element.classList.remove("visible");
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

interface UseRevealGroupOptions extends UseRevealOptions {
  staggerDelay?: number;
}

export function useRevealGroup({
  threshold = 0.1,
  rootMargin = "0px 0px -10% 0px",
  triggerOnce = true,
  staggerDelay = 50,
}: UseRevealGroupOptions = {}) {
  const containerRef = useRef<HTMLElement>(null);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = children.indexOf(entry.target as HTMLElement);
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleIndices((prev) => new Set(prev).add(index));
              entry.target.classList.add("visible");
            }, index * staggerDelay);

            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            setVisibleIndices((prev) => {
              const next = new Set(prev);
              next.delete(index);
              return next;
            });
            entry.target.classList.remove("visible");
          }
        });
      },
      { threshold, rootMargin }
    );

    children.forEach((child) => {
      child.classList.add("reveal");
      observer.observe(child);
    });

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, staggerDelay]);

  return { containerRef, visibleIndices };
}
