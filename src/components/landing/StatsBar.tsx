'use client';

import { useEffect, useRef, useState } from 'react';

const STATS = [
  { value: 500, suffix: '+', label: 'Registered providers' },
  { value: 2400, suffix: '+', label: 'Service requests matched' },
  { value: 15, suffix: ' min', label: 'Average response time' },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1600;
          const steps = 48;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + increment, target);
            setCount(Math.floor(current));
            if (current >= target) clearInterval(timer);
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function StatsBar() {
  return (
    <section className="border-y border-white/[0.06] bg-gray-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
          {STATS.map((stat) => (
            <div key={stat.label} className="px-6 text-center first:pl-0 last:pr-0">
              <p className="text-2xl font-bold text-white sm:text-3xl">
                <Counter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1.5 text-xs text-white/35 tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
