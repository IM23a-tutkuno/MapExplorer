"use client";
import React, { useRef } from 'react';
import {
  Map as MapIcon,
  Globe
} from 'lucide-react';

export default function Home() {
  const mapSectionRef = useRef(null);

  const scrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-clip-text text-transparent text-black ">
                MapExplorer
              </span>
            </div>
            <div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">


        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900">
          This is <span className="text-transparent bg-clip-text bg-gradient-to-r text-black">Map Explorer</span>
        </h1>

        <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
          Clicke auf jeden Ort auf der Karte, um eine KI-generierte Beschreibung zu erhalten. Entdecke neue Orte und lerne neues!
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={scrollToMap}
            className="flex items-center gap-2 bg-black text-white hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-1"
          >
            <MapIcon className="w-5 h-5" />
            Erkunde die Welt!
          </button>
        </div>
      </main>

      <section ref={mapSectionRef} className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      </section>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">


        </div>
      </footer>
    </div>
  );
}