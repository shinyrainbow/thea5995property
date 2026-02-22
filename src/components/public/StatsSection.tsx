// =============================================================================
// THE A 5995 - Stats Section Component
// =============================================================================

'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Building2, Heart, Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Animated counter hook
// ---------------------------------------------------------------------------

function useCountUp(
  target: number,
  duration: number = 2000,
  start: boolean = false,
): number {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, duration, start]);

  return count;
}

// ---------------------------------------------------------------------------
// Stat item
// ---------------------------------------------------------------------------

interface StatItemProps {
  icon: React.ReactNode;
  target: number;
  suffix?: string;
  label: string;
  inView: boolean;
  delay?: number;
}

function StatItem({
  icon,
  target,
  suffix = '',
  label,
  inView,
  delay = 0,
}: StatItemProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => setShouldAnimate(true), delay);
      return () => clearTimeout(timer);
    }
  }, [inView, delay]);

  const count = useCountUp(target, 2000, shouldAnimate);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
        {icon}
      </div>
      <p className="font-heading text-4xl font-bold text-white md:text-5xl">
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-2 text-sm font-medium tracking-wide text-secondary-300 uppercase">
        {label}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StatsSection() {
  const t = useTranslations('stats');
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Intersection Observer for scroll-triggered animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      icon: <Building2 className="h-7 w-7 text-secondary-400" />,
      target: 500,
      suffix: '+',
      label: t('properties'),
    },
    {
      icon: <Heart className="h-7 w-7 text-secondary-400" />,
      target: 1200,
      suffix: '+',
      label: t('happyClients'),
    },
    {
      icon: <Check className="h-7 w-7 text-secondary-400" />,
      target: 350,
      suffix: '+',
      label: t('propertiesSold'),
    },
    {
      icon: <Star className="h-7 w-7 text-secondary-400" />,
      target: 10,
      suffix: '+',
      label: t('yearsExperience'),
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="bg-primary-700 py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {stats.map((stat, i) => (
            <StatItem
              key={stat.label}
              icon={stat.icon}
              target={stat.target}
              suffix={stat.suffix}
              label={stat.label}
              inView={inView}
              delay={i * 150}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
