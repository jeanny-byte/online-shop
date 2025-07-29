import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

interface PromoBannerProps {
  title: string;
  targetDate: string; // ISO string format e.g., "2024-12-31T23:59:59"
}

const PromoBanner: React.FC<PromoBannerProps> = ({ title, targetDate }) => {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft: TimeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = Object.keys(timeLeft).map((interval) => {
    if (!timeLeft[interval as keyof TimeLeft]) {
      return null;
    }

    return (
      <div key={interval} className="text-center">
        <div className="text-4xl md:text-5xl font-bold text-lskin-pink">
          {String(timeLeft[interval as keyof TimeLeft]).padStart(2, '0')}
        </div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {interval}
        </div>
      </div>
    );
  });

  return (
    <div className="bg-secondary text-secondary-foreground py-8 px-4 my-8 rounded-lg">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <h2 className="text-2xl md:text-3xl font-serif text-center md:text-left max-w-md">
          {title}
        </h2>
        <div className="flex items-center gap-4 md:gap-8">
          {timerComponents.length ? timerComponents : <span>Time's up!</span>}
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
