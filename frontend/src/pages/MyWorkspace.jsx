import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Lock,
  Code,
  Lightbulb,
  Upload,
  MessageSquare,
} from "lucide-react";
import TopBar from "../components/TopBar";

const projectPhases = {
  "personal-portfolio": {
    title: "Personal Portfolio Website",
    phases: [
      {
        id: 1,
        title: "Project Setup",
        description:
          "Set up your development environment and create the basic project structure",
        tasks: [
          "Initialize a new React project",
          "Install necessary dependencies (React Router, Tailwind CSS)",
          "Create basic folder structure",
          "Set up development server",
        ],
        codeTemplate: `// Phase 1: Project Setup
// Create a new React project with Vite
// npm create vite@latest my-portfolio -- --template react
// cd my-portfolio
// npm install

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`,
        hints: [
          "Use Vite for faster development",
          "Install Tailwind CSS for styling",
          "Create components folder structure",
          "Set up React Router for navigation",
        ],
      },
      {
        id: 2,
        title: "Basic Layout",
        description:
          "Create the main layout with header, navigation, and footer",
        tasks: [
          "Create Header component with navigation",
          "Build Hero section",
          "Add About section",
          "Create Contact section",
        ],
        codeTemplate: `// Phase 2: Basic Layout
import { useState } from 'react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-lg">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800">
            My Portfolio
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-600 hover:text-blue-600">Home</a>
            <a href="#about" className="text-gray-600 hover:text-blue-600">About</a>
            <a href="#projects" className="text-gray-600 hover:text-blue-600">Projects</a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600">Contact</a>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;`,
        hints: [
          "Use responsive design with Tailwind classes",
          "Add smooth scrolling for navigation links",
          "Include mobile hamburger menu",
          "Use semantic HTML elements",
        ],
      },
      {
        id: 3,
        title: "Styling & Animation",
        description:
          "Add beautiful styling and smooth animations to your portfolio",
        tasks: [
          "Style all components with Tailwind CSS",
          "Add Framer Motion animations",
          "Implement responsive design",
          "Add hover effects and transitions",
        ],
        codeTemplate: `// Phase 3: Styling & Animation
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20"
    >
      <div className="container mx-auto px-6 text-center">
        <motion.h1
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-5xl font-bold mb-4"
        >
          Welcome to My Portfolio
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-xl mb-8"
        >
          Full Stack Developer & UI/UX Designer
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
        >
          View My Work
        </motion.button>
      </div>
    </motion.section>
  );
};

export default Hero;`,
        hints: [
          "Use Framer Motion for smooth animations",
          "Apply consistent color scheme",
          "Add loading states and micro-interactions",
          "Ensure accessibility with proper contrast",
        ],
      },
    ],
  },
};

export default function MyWorkspace() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPhase = parseInt(searchParams.get("phase")) || 1;
  const [currentPhase, setCurrentPhase] = useState(initialPhase);
  const [completedPhases, setCompletedPhases] = useState([1]);
  const [showHints, setShowHints] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  const project = projectPhases[projectId];
  const phase = project?.phases.find((p) => p.id === currentPhase);

  const [code, setCode] = useState(() => phase?.codeTemplate || "");

  useEffect(() => {
    if (phase && phase.codeTemplate !== code) {
      setCode(phase.codeTemplate);
    }
  }, [phase, code]);

  const handlePhaseComplete = () => {
    if (!completedPhases.includes(currentPhase + 1)) {
      setCompletedPhases([...completedPhases, currentPhase + 1]);
    }
    // In a real app, you'd save progress to backend
  };

  const handleCodeUpload = () => {
    // Handle code upload logic
    alert("Code uploaded successfully!");
    handlePhaseComplete();
  };

  const getAIHint = () => {
    const hints = phase?.hints || [];
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    setAiMessage(`💡 Hint: ${randomHint}`);
    setTimeout(() => setAiMessage(""), 5000);
  };

  if (!project) {
    return (
      <div className="flex flex-col min-h-screen bg-[#050B12]">
        <TopBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Project not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#050B12]">
      <TopBar />

      <div className="flex-1 flex">
        {/* Left Sidebar - Project Phases */}
        <div className="w-80 bg-slate-800/50 border-r border-slate-700/50 flex flex-col">
          <div className="p-6 border-b border-slate-700/50">
            <button
              onClick={() => navigate("/project-lab")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              Back to Project Lab
            </button>
            <h1 className="text-xl font-bold text-white">{project.title}</h1>
            <p className="text-sm text-gray-400 mt-1">
              Phase {currentPhase} of {project.phases.length}
            </p>
          </div>

          <div className="flex-1 p-4 space-y-3">
            {project.phases.map((phaseItem) => (
              <motion.div
                key={phaseItem.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  currentPhase === phaseItem.id
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                    : completedPhases.includes(phaseItem.id)
                    ? "bg-green-500/20 border-green-500/50 text-green-400"
                    : phaseItem.id <= Math.max(...completedPhases) + 1
                    ? "bg-slate-700/50 border-slate-600/50 text-gray-300 hover:border-cyan-500/30"
                    : "bg-slate-800/50 border-slate-700/50 text-gray-500 cursor-not-allowed"
                }`}
                onClick={() => {
                  if (phaseItem.id <= Math.max(...completedPhases) + 1) {
                    setCurrentPhase(phaseItem.id);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  {completedPhases.includes(phaseItem.id) ? (
                    <CheckCircle size={20} className="text-green-400" />
                  ) : phaseItem.id > Math.max(...completedPhases) + 1 ? (
                    <Lock size={20} className="text-gray-500" />
                  ) : (
                    <Play size={20} />
                  )}
                  <div>
                    <h3 className="font-semibold text-sm">{phaseItem.title}</h3>
                    <p className="text-xs opacity-75 mt-1">
                      {phaseItem.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Phase Header */}
          <div className="bg-slate-800/30 border-b border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {phase?.title}
                </h2>
                <p className="text-gray-400 mt-1">{phase?.description}</p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowHints(!showHints)}
                  className="bg-purple-500/20 border border-purple-500/50 text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center gap-2"
                >
                  <Lightbulb size={16} />
                  AI Guide
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCodeUpload}
                  className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2"
                >
                  <Upload size={16} />
                  Upload Code
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex">
            {/* AI Guide Panel */}
            <AnimatePresence>
              {showHints && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="bg-slate-800/30 border-r border-slate-700/50 flex flex-col"
                >
                  <div className="p-4 border-b border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <MessageSquare size={20} className="text-purple-400" />
                      AI Guide
                    </h3>
                  </div>
                  <div className="flex-1 p-4 space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-300">
                        Available Hints:
                      </h4>
                      {phase?.hints.map((hint, index) => (
                        <div
                          key={index}
                          className="text-sm text-gray-400 bg-slate-700/30 p-3 rounded-lg"
                        >
                          💡 {hint}
                        </div>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={getAIHint}
                      className="w-full bg-purple-500/20 border border-purple-500/50 text-purple-400 py-2 px-4 rounded-lg hover:bg-purple-500/30 transition-colors"
                    >
                      Get Random Hint
                    </motion.button>
                    {aiMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-purple-500/10 border border-purple-500/30 text-purple-300 p-3 rounded-lg"
                      >
                        {aiMessage}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Code Editor */}
            <div className="flex-1 flex flex-col">
              <div className="bg-slate-900/50 border-b border-slate-700/50 p-4">
                <div className="flex items-center gap-2">
                  <Code size={20} className="text-cyan-400" />
                  <span className="text-gray-300">Code Editor</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    JavaScript/React
                  </span>
                </div>
              </div>
              <div className="flex-1 p-4">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 text-gray-300 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="Write your code here..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
