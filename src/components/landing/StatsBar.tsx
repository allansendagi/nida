'use client';

import { useEffect, useRef, useState } from 'react';

const STATS = [
  { value: 500, suffix: '+', label: 'Registered Providers' },
  { value: 2400, suffix: '+', label: 'Service Requests' },
  { value: 15, suffix: ' min', label: 'Avg Response Time' },
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
          const duration = 1800;
          const steps = 50;
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
    <section className="bg-gray-900 border-y border-white/5">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-3 gap-4 divide-x divide-white/10">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center px-4">
              <p className="text-3xl font-bold text-white sm:text-4xl">
                <Counter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
