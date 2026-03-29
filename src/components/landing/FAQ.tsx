'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'How does AI understand my request?',
    answer: 'When you describe what you need in plain language, our AI analyzes your request to extract key details like service type, location, urgency, and specific requirements. It then matches these against our database of provider capabilities to find the best fits. The more detail you provide, the better the match.',
    audience: 'consumer',
  },
  {
    question: "What's a NOMOS contract?",
    answer: 'A NOMOS (Network of Machine-readable Operational Services) contract is a structured document that defines exactly what services a business provides, where they operate, their pricing ranges, and availability. Unlike traditional profiles, NOMOS contracts are machine-readable, allowing our AI to make precise matches between consumer needs and provider capabilities.',
    audience: 'business',
  },
  {
    question: 'How is pricing determined?',
    answer: 'Providers set their own pricing ranges in their NOMOS contracts. When you receive a match, you\'ll see the provider\'s typical price range for your type of service. Final pricing is agreed between you and the provider based on the specific job requirements. Nida ensures transparency by requiring providers to honor their listed price ranges.',
    audience: 'both',
  },
  {
    question: 'Is Nida only available in Qatar?',
    answer: 'Currently, Nida is focused exclusively on home services in Qatar. We\'re building deep expertise in the local market before expanding. Our goal is to become the leading home services platform in Qatar, then expand to other GCC markets.',
    audience: 'both',
  },
  {
    question: 'How do businesses receive leads?',
    answer: 'When a consumer request matches your NOMOS contract, you\'ll receive a notification with the lead details. Our sequential dispatch system ensures fair distribution - leads go to qualified providers one at a time, giving each a fair chance to respond. You only pay for leads you accept.',
    audience: 'business',
  },
  {
    question: 'Are providers on Nida verified?',
    answer: 'Yes, all businesses on Nida go through a verification process before they can receive leads. We verify business registration, service capabilities, and professional credentials. This ensures consumers only connect with legitimate, qualified providers.',
    audience: 'consumer',
  },
];

function FAQItem({ faq }: { faq: typeof faqs[0] }) {
  const [isOpen, setIsOpen] = useState(false);

  const audienceLabel = {
    consumer: 'Consumer',
    business: 'Business',
    both: 'Both',
  }[faq.audience];

  const audienceColor = {
    consumer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    business: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    both: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  }[faq.audience];

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-start gap-4 py-5 text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', audienceColor)}>
              {audienceLabel}
            </span>
          </div>
          <h3 className="font-semibold">{faq.question}</h3>
        </div>
        <ChevronDown
          className={cn(
            'size-5 shrink-0 text-muted-foreground transition-transform mt-1',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all',
          isOpen ? 'max-h-96 pb-5' : 'max-h-0'
        )}
      >
        <p className="text-muted-foreground leading-relaxed pr-10">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Section header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to know about using Nida.
            </p>
          </div>

          {/* FAQ list */}
          <div className="rounded-xl border bg-card">
            <div className="divide-y px-6">
              {faqs.map((faq) => (
                <FAQItem key={faq.question} faq={faq} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
