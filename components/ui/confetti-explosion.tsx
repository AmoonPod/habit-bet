"use client";

import React, { useCallback, useEffect, useRef, memo } from "react";
import confetti from "canvas-confetti";

interface ConfettiExplosionProps {
  duration?: number; // Duration in milliseconds
  particleCount?: number;
  spread?: number;
  colors?: string[];
}

// Using memo to prevent unnecessary re-renders
export const ConfettiExplosion = memo(function ConfettiExplosion({
  duration = 3000,
  particleCount = 100,
  spread = 70,
  colors = ["#4F46E5", "#22c55e", "#eab308", "#ec4899", "#8b5cf6"],
}: ConfettiExplosionProps) {
  const refAnimationInstance = useRef<confetti.CreateTypes | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getInstance = useCallback(() => {
    if (refAnimationInstance.current === null && canvasRef.current) {
      refAnimationInstance.current = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      });
    }
    return refAnimationInstance.current;
  }, []);

  const fire = useCallback(() => {
    const instance = getInstance();
    if (instance) {
      // Fire once from bottom-center
      instance({
        particleCount,
        spread,
        origin: { y: 1, x: 0.5 },
        colors,
        zIndex: 1000,
        gravity: 0.7,
        scalar: 1.2,
        disableForReducedMotion: true,
      });
    }
  }, [getInstance, particleCount, spread, colors]);

  // Fire on mount and clean up on unmount
  useEffect(() => {
    // Small timeout to ensure canvas is ready
    const initialTimeout = setTimeout(() => {
      fire();
    }, 100);

    const cleanupTimeout = setTimeout(() => {
      if (refAnimationInstance.current) {
        refAnimationInstance.current.reset();
      }
    }, duration);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(cleanupTimeout);
      if (refAnimationInstance.current) {
        refAnimationInstance.current.reset();
      }
    };
  }, [fire, duration]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
});
