import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Button } from './ui/button';

interface WillYouBeMyValentineProps {
  onYes?: () => void;
  yesLabel?: string;
  hideNoButton?: boolean;
}

export const WillYouBeMyValentine = ({ onYes, yesLabel, hideNoButton }: WillYouBeMyValentineProps) => {
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [noButtonAttempts, setNoButtonAttempts] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const moveNoButton = () => {
    if (!containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const buttonWidth = 120;
    const buttonHeight = 48;

    // Calculate safe boundaries
    const maxX = container.width - buttonWidth - 20;
    const maxY = container.height - buttonHeight - 20;

    // Generate random position - make it more evasive as attempts increase
    const evasiveness = Math.min(noButtonAttempts * 0.2 + 1, 3);
    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;

    setNoButtonPosition({ x: newX, y: newY });
    setNoButtonAttempts((prev) => prev + 1);

    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleYes = () => {
    setShowSuccess(true);

    // Trigger confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff006e', '#fb5607', '#ff006e', '#8338ec'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff006e', '#fb5607', '#ff006e', '#8338ec'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    if (onYes) {
      setTimeout(onYes, 2000);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-[400px] flex flex-col items-center justify-center p-8"
    >
      {!showSuccess ? (
        <>
          <motion.h2
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl md:text-4xl text-center mb-8 text-pink-600"
          >
            Will you be my Valentine? 💘
          </motion.h2>

          <div className="flex gap-4 items-center z-10">
            <Button
              onClick={handleYes}
              className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-8 py-6 text-lg"
            >
              {yesLabel || 'Yes! 💕'}
            </Button>

            {!hideNoButton && (
              <motion.div
                style={{
                  position: noButtonAttempts > 0 ? 'absolute' : 'relative',
                  left: noButtonAttempts > 0 ? noButtonPosition.x : 'auto',
                  top: noButtonAttempts > 0 ? noButtonPosition.y : 'auto',
                }}
                animate={{
                  scale: noButtonAttempts > 0 ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onMouseEnter={moveNoButton}
                  onTouchStart={moveNoButton}
                  onClick={moveNoButton}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-100 px-8 py-6 text-lg"
                >
                  No 😢
                </Button>
              </motion.div>
            )}
          </div>

          {noButtonAttempts > 0 && !hideNoButton && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-sm text-gray-600 text-center"
            >
              {noButtonAttempts === 1 && "Oh no! The button moved! 😏"}
              {noButtonAttempts === 2 && "Hehe, it's running away! 😄"}
              {noButtonAttempts === 3 && "You can't catch it that easily! 😜"}
              {noButtonAttempts === 4 && "Come on, just say yes! 💕"}
              {noButtonAttempts >= 5 && "The button really wants you to say yes! ❤️"}
            </motion.p>
          )}
        </>
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-4xl mb-4 text-pink-600">Yay! 💕</h2>
          <p className="text-xl text-gray-700">
            You made my day! Happy Valentine's! ❤️
          </p>
        </motion.div>
      )}
    </div>
  );
};
