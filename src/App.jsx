import React from 'react';
import SecurePlayer from './SecurePlayer';
import { PlayCircle, ShieldCheck, Lock, BookOpen } from 'lucide-react';

function App() {
  const dummyLessons = [
    { title: "Introduction to Advanced Algorithms", duration: "12:30", active: true },
    { title: "Dynamic Programming Foundations", duration: "45:10", active: false },
    { title: "Graph Theory Masterclass", duration: "55:00", active: false },
    { title: "System Design: Scalability module", duration: "40:20", active: false },
    { title: "Mock Interview Security Review", duration: "32:15", active: false },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col items-center">
      {/* Hero Header */}
      <header className="w-full bg-slate-800/80 backdrop-blur-md border-b border-slate-700 py-6 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center sm:sticky sm:top-0 z-40 gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            SecureStream Pro
          </h1>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Start Learning
        </button>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Advanced Algorithms</h2>
            <Lock className="w-5 h-5 text-emerald-400" title="Secure End-to-End Encryption" />
          </div>
          <p className="text-slate-400 text-sm md:text-base mb-6 max-w-3xl leading-relaxed">
            This module is tightly secured to prevent content leaks. The video viewer contains intelligent 
            anti-piracy overlays, right-click disabling, copy-protection, devtools detection and strict CORS handling.
          </p>

          <SecurePlayer />

          <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700 mt-8 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              Lesson Overview <ShieldCheck className="w-4 h-4 text-emerald-500"/>
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              This session uses Bunny.net global Edge network. Your user footprint is embedded in a constantly shifting watermark 
              to maximize copyright protection without compromising viewing experience. Accessing debugging tools will suspend the playback automatically.
            </p>
          </div>
        </div>

        {/* Sidebar: Lesson List */}
        <aside className="w-full lg:w-80 xl:w-96 bg-slate-800/90 border border-slate-700 rounded-xl overflow-hidden shadow-2xl self-start sm:sticky sm:top-28">
          <div className="p-5 border-b border-slate-700 bg-slate-800/50">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-indigo-400"/> Course Index
            </h3>
          </div>
          <div className="divide-y divide-slate-700/50">
            {dummyLessons.map((lesson, index) => (
              <button 
                key={index}
                className={`w-full text-left p-4 hover:bg-slate-700/50 transition-colors flex flex-col sm:flex-row sm:justify-between items-start sm:items-center group
                  ${lesson.active ? 'bg-indigo-900/20 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
              >
                <div>
                  <span className="text-xs text-slate-500 font-mono mb-1 block group-hover:text-indigo-400/70 transition-colors">Lesson {index + 1}</span>
                  <p className={`font-medium ${lesson.active ? 'text-indigo-300' : 'text-slate-300 group-hover:text-white'}`}>
                    {lesson.title}
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded mt-2 sm:mt-0 shadow-inner block shrink-0">
                  {lesson.duration}
                </span>
              </button>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
