import React, { useEffect, useState, useRef } from 'react';
import { Text, TextStyle } from 'react-native';

interface MatrixTextProps {
  text: string;
  style?: TextStyle;
  duration?: number;
  interval?: number;
}

const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*';

export const MatrixText: React.FC<MatrixTextProps> = ({
  text,
  style,
  duration = 1000
}) => {
  const [displayText, setDisplayText] = useState('');
  const frameRef = useRef<number>(0);
  const revealTimesRef = useRef<number[]>([]);

  useEffect(() => {
    // Initialize reveal times
    revealTimesRef.current = text.split('').map(() => Math.random() * 0.7);

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const result = text.split('').map((char, i) => {
        if (char === ' ') return ' ';

        // Use a small buffer to ensure the scramble happens before reveal
        if (progress > revealTimesRef.current[i] + 0.15) {
          return char;
        }

        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');

      setDisplayText(result);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, duration]);

  return <Text style={style}>{displayText}</Text>;
};
