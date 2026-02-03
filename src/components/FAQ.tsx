import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import backgroundImage from 'figma:asset/a8da570cea4bfc88a919fb301bb3b3c2d4da4606.png';
import { TEXTS } from '@/content/texts';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: TEXTS.faq.items.item1.q,
    answer: TEXTS.faq.items.item1.a
  },
  {
    question: TEXTS.faq.items.item2.q,
    answer: TEXTS.faq.items.item2.a
  },
  {
    question: TEXTS.faq.items.item3.q,
    answer: TEXTS.faq.items.item3.a
  },
  {
    question: TEXTS.faq.items.item4.q,
    answer: TEXTS.faq.items.item4.a
  },
  {
    question: TEXTS.faq.items.item5.q,
    answer: TEXTS.faq.items.item5.a
  },
  {
    question: TEXTS.faq.items.item6.q,
    answer: TEXTS.faq.items.item6.a
  },
  {
    question: TEXTS.faq.items.item7.q,
    answer: TEXTS.faq.items.item7.a
  },
  {
    question: TEXTS.faq.items.item8.q,
    answer: TEXTS.faq.items.item8.a
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div 
      className="min-h-screen pt-32 pb-20 px-6 relative"
      style={{ backgroundColor: '#000935' }}
    >
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          opacity: 0.5
        }}
      />
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundColor: '#000935',
          opacity: 0.5
        }}
      />

      <div className="container mx-auto max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: '#00C9CE20' }}>
            <HelpCircle className="w-10 h-10" style={{ color: '#00C9CE' }} />
          </div>
          <h1 className="text-4xl md:text-5xl mb-6" style={{ color: '#FFFFFF', fontFamily: 'REM, sans-serif', fontWeight: 500 }}>
            {TEXTS.faq.title}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {TEXTS.faq.subtitle}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="rounded-lg overflow-hidden border transition-all"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: openIndex === index ? '#00C9CE' : 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-white/5 transition-colors"
              >
                <span 
                  className="text-lg"
                  style={{ color: '#FFFFFF' }}
                >
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  style={{ color: '#00C9CE' }}
                />
              </button>
              
              {openIndex === index && (
                <div 
                  className="px-6 pb-5 text-gray-300 leading-relaxed"
                  style={{ paddingTop: '0' }}
                >
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div 
          className="mt-16 p-8 rounded-lg text-center"
          style={{ backgroundColor: 'rgba(0, 201, 206, 0.1)', borderColor: '#00C9CE' }}
        >
          <h3 className="text-2xl mb-4" style={{ color: '#FFFFFF' }}>
            {TEXTS.faq.ctaTitle}
          </h3>
          <p className="text-gray-300 mb-6">
            {TEXTS.faq.ctaDescription}
          </p>
          <Link
            to="/contacto"
            className="inline-block px-8 py-3 rounded-lg transition-all hover:scale-105"
            style={{ backgroundColor: '#00C9CE', color: '#000935' }}
          >
            {TEXTS.faq.ctaButton}
          </Link>
        </div>
      </div>
    </div>
  );
}