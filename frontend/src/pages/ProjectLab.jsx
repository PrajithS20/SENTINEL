// ProjectLab.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import QuickActions from "../components/QuickActions";
import ProjectSuggestions from "../components/ProjectSuggestions";

export default function ProjectLab() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-screen bg-[#050B12]"
    >
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 text-neon hover:text-neon/80 transition-colors mb-8">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-neon mb-8">Project Lab</h1>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* LEFT HALF - Quick Actions (Chatbot + Resume Upload) */}
          <div className="w-full">
            <QuickActions />
          </div>

          {/* RIGHT HALF - Project Suggestions */}
          <div className="w-full">
            <ProjectSuggestions />
          </div>
        </div>
      </div>
    </motion.div>
  );
}