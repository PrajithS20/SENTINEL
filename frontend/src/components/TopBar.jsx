import { motion } from "framer-motion";
import { Settings, Newspaper, Rocket, Zap, TrendingUp } from "lucide-react";

const newsItems = [
  { icon: Settings, text: "AI Career Tools Updated", color: "text-blue-400" },
  { icon: Newspaper, text: "Tech Job Market Booming", color: "text-green-400" },
  { icon: Rocket, text: "New Features Released", color: "text-purple-400" },
  { icon: Zap, text: "Lightning Fast Responses", color: "text-yellow-400" },
  { icon: TrendingUp, text: "Career Growth Analytics", color: "text-cyan-400" },
];

export default function TopBar() {
  return (
    <div className="glass-effect px-6 py-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 animate-pulse-slow"></div>
      <motion.div
        className="flex gap-8 text-sm text-gray-300 whitespace-nowrap relative z-10"
        animate={{ x: [0, -1500] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 25,
            ease: "linear",
          },
        }}
      >
        {[...newsItems, ...newsItems].map((item, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2 flex-shrink-0 hover:scale-105 transition-transform cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <item.icon size={16} className={`${item.color} animate-pulse`} />
            <span className="hover:text-cyan-400 transition-colors">{item.text}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
