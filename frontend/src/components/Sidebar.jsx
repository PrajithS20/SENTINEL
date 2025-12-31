import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProgressStore } from "../store/useProgressStore";
import {
  LayoutDashboard,
  FlaskConical,
  Map,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  User,
  BookOpen,
  LogOut,
  Code,
  GraduationCap,
  Users, // Added Users here
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Project Lab", icon: FlaskConical, path: "/project-lab" },
  { label: "My Lab", icon: Code, path: "/my-lab" },
  { label: "Collaborate", icon: Users, path: "/collaborate" },
  { label: "Resources", icon: BookOpen, path: "/resources" },
  { label: "Offline Atlas", icon: Map, path: "/offline-atlas" },
  { label: "Job Hub", icon: Briefcase, path: "/job-hub" },
];

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useProgressStore();

  return (
    <>
      {/* Collapsed Sidebar Toggle */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed left-0 top-20 z-50"
          >
            <button
              onClick={toggleSidebar}
              className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 p-3 rounded-r-lg shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 group"
            >
              <ChevronRight
                size={20}
                className="text-gray-400 group-hover:text-cyan-400 transition-colors"
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full flex flex-col p-6 border-r border-gray-900/50 shadow-2xl relative"
            style={{
              backgroundImage: "url('/assets/wood_texture.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'left center'
            }}
          >
            {/* Dark overlay for readability if needed */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-10">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-cyan-400 text-xl font-bold tracking-widest hover:text-cyan-300 transition-colors cursor-pointer"
                  onClick={() => navigate("/")}
                >
                  SENTINEL
                </motion.h1>
                <button
                  onClick={toggleSidebar}
                  className="text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>

              <motion.nav
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 space-y-2 text-sm"
              >
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`nav-item cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${location.pathname === item.path
                      ? "bg-white/10 backdrop-blur-md text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-bold"
                      : "text-gray-100 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm border border-transparent font-medium drop-shadow-md"
                      }`}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon
                      size={18}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span>{item.label}</span>
                  </motion.div>
                ))}
              </motion.nav>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 pt-4 border-t border-gray-800/50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <User size={16} className="text-gray-400" />
                  <p className="text-xs text-gray-300 uppercase tracking-wide font-semibold drop-shadow">
                    My Account
                  </p>
                </div>
                <p className="font-medium text-neon">Cadet X</p>
                <p className="text-xs text-gray-500 mb-3">Unrated</p>

                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300 group font-medium drop-shadow-sm"
                >
                  <LogOut
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <span>Logout</span>
                </button>
              </motion.div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
