import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Mic, Video, CheckCircle, Star, Shield, Car, User, ChevronRight, Battery, Gauge } from "lucide-react";

type DesignStyle = "trust-blue" | "dark-professional" | "clean-minimal";

const DesignExploration = () => {
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>("trust-blue");

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">DriveX Design Exploration</h1>
          <p className="text-slate-400">Choose your preferred design direction</p>
        </header>

        {/* Style Selector */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Button
            variant={selectedStyle === "trust-blue" ? "default" : "outline"}
            onClick={() => setSelectedStyle("trust-blue")}
            className={selectedStyle === "trust-blue" 
              ? "bg-blue-600 hover:bg-blue-700" 
              : "border-slate-600 text-slate-300 hover:bg-slate-800"}
          >
            Trust Blue + Gold
          </Button>
          <Button
            variant={selectedStyle === "dark-professional" ? "default" : "outline"}
            onClick={() => setSelectedStyle("dark-professional")}
            className={selectedStyle === "dark-professional" 
              ? "bg-slate-700 hover:bg-slate-600" 
              : "border-slate-600 text-slate-300 hover:bg-slate-800"}
          >
            Dark Professional
          </Button>
          <Button
            variant={selectedStyle === "clean-minimal" ? "default" : "outline"}
            onClick={() => setSelectedStyle("clean-minimal")}
            className={selectedStyle === "clean-minimal" 
              ? "bg-white text-black hover:bg-gray-100" 
              : "border-slate-600 text-slate-300 hover:bg-slate-800"}
          >
            Clean Minimal
          </Button>
        </div>

        {/* Preview Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {selectedStyle === "trust-blue" && <TrustBluePreview />}
          {selectedStyle === "dark-professional" && <DarkProfessionalPreview />}
          {selectedStyle === "clean-minimal" && <CleanMinimalPreview />}
        </div>

        {/* Style Description */}
        <div className="mt-8 text-center">
          {selectedStyle === "trust-blue" && (
            <div className="bg-blue-950/50 border border-blue-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-300 mb-2">Trust Blue + Gold</h3>
              <p className="text-slate-400">Deep blues convey trust and reliability. Gold accents signal premium quality and success. Serious banking aesthetic that builds confidence in the inspection process.</p>
            </div>
          )}
          {selectedStyle === "dark-professional" && (
            <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-emerald-400 mb-2">Dark Professional</h3>
              <p className="text-slate-400">Charcoal base with forensic tool aesthetics. Feels like professional diagnostic equipment. High contrast for outdoor use, reduced eye strain in showrooms.</p>
            </div>
          )}
          {selectedStyle === "clean-minimal" && (
            <div className="bg-white/10 border border-white/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Clean Minimal</h3>
              <p className="text-slate-400">High contrast black and white with bold accent. Compliance platform feel. Maximum clarity, zero distraction. Content-first approach.</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">Click a style above to preview • Both Home & Capture screens shown</p>
        </div>
      </div>
    </div>
  );
};

// Trust Blue + Gold Design
const TrustBluePreview = () => (
  <>
    {/* Home Screen */}
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-blue-900/50">
      <div className="bg-gradient-to-b from-blue-950 via-blue-900 to-slate-900 p-5 min-h-[500px]">
        {/* Status Bar Mock */}
        <div className="flex justify-between text-xs text-blue-300/70 mb-4">
          <span>9:41</span>
          <div className="flex gap-1">
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-blue-300/70 text-sm">Good morning</p>
            <h2 className="text-xl font-bold text-white">Rajesh Kumar</h2>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-950" />
          </div>
        </div>

        {/* Trust Score Card */}
        <div className="bg-gradient-to-r from-blue-800/40 to-blue-700/30 backdrop-blur border border-blue-600/30 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300/70 text-xs uppercase tracking-wider">Trust Score</p>
              <p className="text-3xl font-bold text-white">847</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-semibold">Gold Level</span>
              </div>
              <p className="text-blue-300/50 text-xs">23 inspections this month</p>
            </div>
          </div>
        </div>

        {/* Primary Action */}
        <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-blue-950 font-bold py-4 rounded-xl mb-4 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
          <Camera className="w-5 h-5" />
          Start New Inspection
        </button>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-900/30 border border-blue-800/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">4</p>
            <p className="text-blue-300/60 text-xs">Pending</p>
          </div>
          <div className="bg-blue-900/30 border border-blue-800/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">12</p>
            <p className="text-blue-300/60 text-xs">Today</p>
          </div>
          <div className="bg-blue-900/30 border border-blue-800/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">98%</p>
            <p className="text-blue-300/60 text-xs">Accuracy</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-4">
          <h3 className="text-blue-300/70 text-sm mb-2">Recent Inspections</h3>
          <div className="bg-blue-900/20 border border-blue-800/20 rounded-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-800/50 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-300" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">MH-12-AB-1234</p>
              <p className="text-blue-300/50 text-xs">Honda City • 15 min ago</p>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>
    </div>

    {/* Capture Screen */}
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-blue-900/50">
      <div className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 p-5 min-h-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button className="text-blue-300">← Back</button>
          <h2 className="text-white font-semibold">Capture Evidence</h2>
          <span className="text-amber-400 text-sm">4/12</span>
        </div>

        {/* Progress */}
        <div className="h-1 bg-blue-900/50 rounded-full mb-6">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full w-1/3"></div>
        </div>

        {/* Camera Viewfinder */}
        <div className="aspect-[4/3] bg-slate-800 rounded-xl mb-4 relative overflow-hidden border-2 border-blue-600/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-dashed border-amber-400/50 rounded-lg w-3/4 h-3/4 flex items-center justify-center">
              <p className="text-amber-400/70 text-sm">Front View</p>
            </div>
          </div>
          <div className="absolute bottom-3 left-3 bg-blue-950/80 text-blue-300 text-xs px-2 py-1 rounded">
            📍 Mumbai, MH
          </div>
          <div className="absolute bottom-3 right-3 bg-blue-950/80 text-blue-300 text-xs px-2 py-1 rounded">
            10:24 AM
          </div>
        </div>

        {/* Current Angle */}
        <div className="text-center mb-4">
          <h3 className="text-white text-lg font-semibold">Front View</h3>
          <p className="text-blue-300/60 text-sm">Capture the front of the vehicle</p>
        </div>

        {/* Capture Controls */}
        <div className="flex items-center justify-center gap-6">
          <button className="w-12 h-12 bg-blue-800/50 rounded-full flex items-center justify-center border border-blue-700">
            <Video className="w-5 h-5 text-blue-300" />
          </button>
          <button className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 border-4 border-amber-400/50">
            <Camera className="w-7 h-7 text-blue-950" />
          </button>
          <button className="w-12 h-12 bg-blue-800/50 rounded-full flex items-center justify-center border border-blue-700">
            <Mic className="w-5 h-5 text-blue-300" />
          </button>
        </div>

        {/* Angle Thumbnails */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {["Front", "Rear", "Left", "Right", "Engine"].map((angle, i) => (
            <div key={angle} className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center text-xs ${i < 3 ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400' : 'bg-blue-900/30 border border-blue-800/30 text-blue-300/60'}`}>
              {i < 3 ? <CheckCircle className="w-5 h-5" /> : angle}
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

// Dark Professional Design
const DarkProfessionalPreview = () => (
  <>
    {/* Home Screen */}
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
      <div className="bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 p-5 min-h-[500px]">
        {/* Status Bar Mock */}
        <div className="flex justify-between text-xs text-slate-500 mb-4">
          <span>9:41</span>
          <Battery className="w-4 h-4" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-slate-500 text-sm">Inspector</p>
            <h2 className="text-xl font-bold text-white">Rajesh Kumar</h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-slate-400 text-xs uppercase tracking-wider">Trust</span>
            </div>
            <p className="text-2xl font-mono font-bold text-white">847</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-slate-400 text-xs uppercase tracking-wider">Queue</span>
            </div>
            <p className="text-2xl font-mono font-bold text-white">4</p>
          </div>
        </div>

        {/* Primary Action */}
        <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-4 rounded-lg mb-4 flex items-center justify-center gap-2 transition-colors">
          <Camera className="w-5 h-5" />
          NEW INSPECTION
        </button>

        {/* Action Cards */}
        <div className="space-y-2">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Gauge className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-white font-medium">Pending Consents</p>
                <p className="text-slate-500 text-sm">3 awaiting approval</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-medium">Recent Reports</p>
                <p className="text-slate-500 text-sm">12 completed today</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-center">
          <div>
            <p className="text-slate-500 text-xs">Accuracy</p>
            <p className="text-emerald-400 font-mono">98.2%</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Streak</p>
            <p className="text-amber-400 font-mono">15 days</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Coins</p>
            <p className="text-cyan-400 font-mono">2,450</p>
          </div>
        </div>
      </div>
    </div>

    {/* Capture Screen */}
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
      <div className="bg-slate-900 p-5 min-h-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button className="text-slate-400 text-sm">← EXIT</button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white font-mono text-sm">RECORDING</span>
          </div>
          <span className="text-emerald-400 font-mono text-sm">04/12</span>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-1 mb-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i < 4 ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
          ))}
        </div>

        {/* Camera Viewfinder */}
        <div className="aspect-[4/3] bg-slate-800 rounded-lg mb-4 relative overflow-hidden border border-slate-700">
          <div className="absolute inset-4 border border-dashed border-emerald-400/40 rounded flex items-center justify-center">
            <div className="text-center">
              <p className="text-emerald-400 font-mono text-sm">FRONT VIEW</p>
              <p className="text-slate-500 text-xs mt-1">Align vehicle in frame</p>
            </div>
          </div>
          {/* Corner markers */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-emerald-400"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-emerald-400"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-emerald-400"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-emerald-400"></div>
          
          {/* Metadata overlay */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-between px-3">
            <span className="bg-slate-900/90 text-slate-300 text-xs px-2 py-1 rounded font-mono">19.0760°N</span>
            <span className="bg-slate-900/90 text-slate-300 text-xs px-2 py-1 rounded font-mono">10:24:33</span>
          </div>
        </div>

        {/* Capture Controls */}
        <div className="flex items-center justify-center gap-8 mb-4">
          <button className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
            <Video className="w-5 h-5 text-slate-400" />
          </button>
          <button className="w-16 h-16 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Camera className="w-7 h-7 text-slate-900" />
          </button>
          <button className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
            <Mic className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Angle Queue */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["FRT", "RER", "LFT", "RGT", "ENG"].map((angle, i) => (
            <div key={angle} className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xs font-mono ${i < 3 ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400' : 'bg-slate-800 border border-slate-700 text-slate-500'}`}>
              {i < 3 ? "✓" : angle}
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

// Clean Minimal Design
const CleanMinimalPreview = () => (
  <>
    {/* Home Screen */}
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
      <div className="bg-white p-5 min-h-[500px]">
        {/* Status Bar Mock */}
        <div className="flex justify-between text-xs text-slate-400 mb-6">
          <span>9:41</span>
          <Battery className="w-4 h-4" />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Good morning,</h2>
          <h2 className="text-2xl font-bold text-slate-900">Rajesh</h2>
        </div>

        {/* Trust Score */}
        <div className="mb-8">
          <p className="text-slate-400 text-sm mb-1">Trust Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-slate-900">847</span>
            <span className="text-emerald-500 text-sm">+12 ↑</span>
          </div>
        </div>

        {/* Primary Action */}
        <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 rounded-xl mb-6 flex items-center justify-center gap-2">
          <Camera className="w-5 h-5" />
          Start Inspection
        </button>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">4</p>
            <p className="text-slate-400 text-sm">Pending</p>
          </div>
          <div className="text-center border-x border-slate-100">
            <p className="text-3xl font-bold text-slate-900">12</p>
            <p className="text-slate-400 text-sm">Today</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-500">98%</p>
            <p className="text-slate-400 text-sm">Accuracy</p>
          </div>
        </div>

        {/* Recent */}
        <div>
          <p className="text-slate-400 text-sm mb-3">Recent</p>
          <div className="border border-slate-100 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="text-slate-900 font-medium">MH-12-AB-1234</p>
              <p className="text-slate-400 text-sm">Honda City • 15m ago</p>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </div>
    </div>

    {/* Capture Screen */}
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
      <div className="bg-slate-900 p-5 min-h-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button className="text-white text-sm">Cancel</button>
          <h2 className="text-white font-medium">Capture</h2>
          <span className="text-white text-sm">4/12</span>
        </div>

        {/* Progress */}
        <div className="h-0.5 bg-slate-700 rounded-full mb-6">
          <div className="h-0.5 bg-white rounded-full w-1/3"></div>
        </div>

        {/* Camera Viewfinder */}
        <div className="aspect-[4/3] bg-slate-800 rounded-xl mb-6 relative overflow-hidden">
          <div className="absolute inset-8 border-2 border-white/30 rounded-lg"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/70 text-lg">Front View</p>
          </div>
          {/* Minimal metadata */}
          <div className="absolute bottom-4 left-4 text-white/50 text-xs">Mumbai • 10:24</div>
        </div>

        {/* Current Angle Label */}
        <div className="text-center mb-6">
          <h3 className="text-white text-xl font-medium">Front</h3>
          <p className="text-slate-400 text-sm">Position the front of vehicle in frame</p>
        </div>

        {/* Capture Button */}
        <div className="flex items-center justify-center gap-8">
          <button className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </button>
          <button className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-slate-900 rounded-full"></div>
          </button>
          <button className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Angle Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i < 4 ? 'bg-white' : 'bg-slate-600'}`}></div>
          ))}
        </div>
      </div>
    </div>
  </>
);

export default DesignExploration;
