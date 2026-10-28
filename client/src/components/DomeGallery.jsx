import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

const galleryPhotos = [
  {
    title: 'C-Suite Conclave 2026',
    location: 'The Taj Mahal Palace, Mumbai',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&q=80',
    caption: 'Over 200 CEOs and Founders in deep discussion on AI governance.'
  },
  {
    title: 'Closed-Door CFO Roundtable',
    location: 'The Oberoi, Bengaluru',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1000&q=80',
    caption: 'Capital allocation and risk resilience with leading financial strategists.'
  },
  {
    title: 'Executive Disruption Conclave',
    location: 'ITC Maurya, New Delhi',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&q=80',
    caption: 'Strategic foresight and cross-border expansions across South Asia.'
  },
  {
    title: 'Global Advisory Board Conclave',
    location: 'Marina Bay Sands, Singapore',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1000&q=80',
    caption: 'Connecting APAC business titans for bilateral trade alliances.'
  }
];

const DomeGallery = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => {
    setActiveIndex((curr) => (curr === 0 ? galleryPhotos.length - 1 : curr - 1));
  };

  const next = () => {
    setActiveIndex((curr) => (curr === galleryPhotos.length - 1 ? 0 : curr + 1));
  };

  const active = galleryPhotos[activeIndex];

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900">
      <div className="relative h-80 sm:h-96 md:h-[450px] w-full">
        <img
          src={active.image}
          alt={active.title}
          className="w-full h-full object-cover transition-all duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Caption */}
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/80 text-xs font-semibold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{active.location}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1">
            {active.title}
          </h3>
          <p className="text-sm text-slate-300 max-w-xl">
            {active.caption}
          </p>
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 right-6 flex items-center gap-2">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md flex items-center justify-center transition-all"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md flex items-center justify-center transition-all"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="bg-slate-950 px-6 py-4 flex items-center justify-center gap-3 overflow-x-auto">
        {galleryPhotos.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`relative rounded-xl overflow-hidden h-14 w-24 flex-shrink-0 transition-all border-2 ${
              idx === activeIndex ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default DomeGallery;
