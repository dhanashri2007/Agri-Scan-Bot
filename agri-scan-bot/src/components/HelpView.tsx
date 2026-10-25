import React, { useState } from 'react';
import {
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Bot,
  Camera,
  Wifi,
  Battery,
  Sparkles,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface HelpViewProps {
  language: Language;
}

export const HelpView: React.FC<HelpViewProps> = ({ language }) => {
  const t = translations[language];
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const guides = [
    {
      title: '1. Robot Not Connecting / "Robot Offline"',
      icon: Bot,
      content:
        '• Check the main 12V Li-ion battery switch on the 4WD chassis.\n• Ensure the blue LED on the ESP32 microcontroller is steady or blinking.\n• Verify your mobile phone or tablet is connected to the same local Wi-Fi network (or the robot hotspot).\n• If the connection drops, tap "Connect Robot" or check the Robot Health page.',
    },
    {
      title: '2. ESP32 Microcontroller Not Responding',
      icon: AlertTriangle,
      content:
        '• Press the physical "EN / RST" push-button on the ESP32 board to reboot the firmware.\n• Check that the motor driver 5V logic cable is firmly seated into VIN.\n• In the Robot Health page, inspect the Last Heartbeat timestamp to ensure UDP packets are arriving.',
    },
    {
      title: '3. ESP32-CAM Camera Not Working or Black Frame',
      icon: Camera,
      content:
        '• Make sure the golden ribbon cable of the OV2640 camera sensor is securely locked inside the FPC connector.\n• Ensure adequate daylight on the crop leaf; low light causes camera sensor timeout.\n• Avoid placing the lens closer than 15 cm from the plant to prevent optical defocusing.',
    },
    {
      title: '4. Image Unclear / "Please upload a clearer leaf image"',
      icon: Sparkles,
      content:
        '• Center the suspect leaf in the viewfinder.\n• Ensure the leaf blade (lamina) fills at least 60% of the photograph.\n• Avoid heavy backlighting, strong shadows, or moving leaves in gusty winds.\n• Wipe dust or dew off the camera lens with a microfiber cloth.',
    },
    {
      title: '5. AI Analysis Failed or Timed Out',
      icon: AlertTriangle,
      content:
        '• The vision AI requires an active internet connection to evaluate the neural network.\n• In offline field conditions, you can still save images locally and upload once 4G/Wi-Fi signal is restored.\n• Verify that the uploaded file is a valid image (JPG, PNG, WebP) under 10MB.',
    },
    {
      title: '6. Wi-Fi Disconnected in Remote Field Rows',
      icon: Wifi,
      content:
        '• Standard 2.4GHz Wi-Fi reaches approximately 30–50 meters without high-gain repeaters.\n• Mount a low-cost Wi-Fi directional antenna or portable 4G hotspot on the robot chassis for extended field coverage.\n• If signal is lost, the robot automatically activates fail-safe stop to prevent runaway movement.',
    },
    {
      title: '7. Using AGRI-SCAN App Offline',
      icon: CheckCircle2,
      content:
        '• This Progressive Web App (PWA) caches all interfaces and previous scan history on your device.\n• You can review past diagnoses, view farmer guides, and read government scheme information without internet.\n• New cloud AI disease scans will execute as soon as cellular data reconnects.',
    },
    {
      title: '8. 4WD Robot Battery & Motor Maintenance',
      icon: Battery,
      content:
        '• Recharge the 3S 12V Li-ion pack when voltage dips below 11.1V to prolong cell longevity.\n• Clear field mud, dried soil, and weed roots from the rubber tires and motor wheel shafts after each scouting session.',
    },
  ];

  const filteredGuides = guides.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          <span>{t.nav.help} & Troubleshooting</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Field solutions for hardware setup, camera issues, connection drops, and AI diagnoses.
        </p>

        <div className="mt-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search troubleshooting questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredGuides.map((guide, idx) => {
          const Icon = guide.icon;
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden transition shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/60 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white">{guide.title}</span>
                </div>

                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800 whitespace-pre-line">
                  {guide.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
