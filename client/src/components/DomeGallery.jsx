import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { eventService } from '../services/api';

const DomeGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await eventService.getEvents();
        if (res.data?.success && res.data.data.length > 0) {
          const extracted = [];
          res.data.data.forEach((evt) => {
            if (evt.banner || evt.bannerUrl) {
              extracted.push({
                title: evt.title,
                location: `${evt.venue || 'Executive Venue'}, ${evt.location || 'India'}`,
                image: evt.banner || evt.bannerUrl,
                caption: evt.description || 'Closed-door C-Suite leadership deliberations.'
              });
            }
            if (evt.gallery && Array.isArray(evt.gallery)) {
              evt.gallery.forEach((gImg, idx) => {
                extracted.push({
                  title: `${evt.title} - Session ${idx + 1}`,
                  location: evt.location || 'Summit Conclave',
                  image: gImg,
                  caption: 'Executive boardroom proceedings and collaborative strategy.'
                });
              });
            }
          });
          if (extracted.length > 0) {
            setPhotos(extracted);
          }
        }
      } catch (err) {
        console.error('[DomeGallery fetch error]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const prev = () => {
    setActiveIndex((curr) => (curr === 0 ? photos.length - 1 : curr - 1));
  };

  const next = () => {
    setActiveIndex((curr) => (curr === photos.length - 1 ? 0 : curr + 1));
  };

  if (loading || photos.length === 0) {
    return (
      <div className="relative w-full max-w-5xl mx-auto rounded-3xl h-80 flex items-center justify-center bg-[#0d1527] border border-[#E2E8F0]/20 text-slate-400">
        <p className="text-sm font-semibold">Loading summit retrospectives from MongoDB...</p>
      </div>
    );
  }

  const active = photos[activeIndex] || photos[0];

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 bg-[#0d1527]">
      <div className="relative h-80 sm:h-96 md:h-[450px] w-full">
        <img
          src={active.image}
          alt={active.title}
          className="w-full h-full object-cover transition-all duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1527] via-[#0d1527]/40 to-transparent" />

        {/* Caption */}
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0066CC] text-xs font-semibold uppercase tracking-wider mb-2 shadow-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span>{active.location}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1">
            {active.title}
          </h3>
          <p className="text-sm text-slate-300 max-w-xl line-clamp-2">
            {active.caption}
          </p>
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 right-6 flex items-center gap-2">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#0d1527] backdrop-blur-md flex items-center justify-center transition-all"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#0d1527] backdrop-blur-md flex items-center justify-center transition-all"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="bg-[#090d18] px-6 py-4 flex items-center justify-center gap-3 overflow-x-auto scrollbar-thin">
        {photos.slice(0, 8).map((item, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`relative rounded-xl overflow-hidden h-14 w-24 flex-shrink-0 transition-all border-2 ${
              idx === activeIndex ? 'border-[#0066CC] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
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
