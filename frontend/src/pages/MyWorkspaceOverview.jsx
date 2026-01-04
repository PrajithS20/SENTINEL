import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Code, Globe, Database, Smartphone, Cpu, Play, CheckCircle, Clock, Trash2 } from "lucide-react";
import TopBar from "../components/TopBar";

const userWorkspaces = [
  {
    id: "personal-portfolio",
    title: "Personal Portfolio Website",
    description: "Build a responsive portfolio showcasing your skills and projects",
    tech: ["React", "Tailwind CSS", "Framer Motion"],
    icon: Globe,
    difficulty: "Beginner",
    color: "from-blue-500 to-cyan-600",
    status: "in-progress",
    progress: 60,
    lastUpdated: "2 hours ago",
    currentPhase: 2
  },
  {
    id: "task-manager",
    title: "Task Management App",
    description: "Create a full-stack task manager with user authentication",
    tech: ["React", "Node.js", "MongoDB"],
    icon: Code,
    difficulty: "Intermediate",
    color: "from-green-500 to-emerald-600",
    status: "completed",
    progress: 100,
    lastUpdated: "1 day ago",
    currentPhase: 4
  },
  {
    id: "data-dashboard",
    title: "Data Visualization Dashboard",
    description: "Build interactive charts and graphs for data analysis",
    tech: ["React", "D3.js", "Python"],
    icon: Database,
    difficulty: "Advanced",
    color: "from-purple-500 to-pink-600",
    status: "not-started",
    progress: 0,
    lastUpdated: "Never",
    currentPhase: 1
  }
];

export default function MyWorkspaceOverview() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/workspace")
      .then(res => res.json())
      .then(data => {
        setWorkspaces(data.projects || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch active projects:", err);
        setLoading(false);
      });
  }, []);

  const getStatusIcon = (phase, total) => {
    if (phase >= total) return <CheckCircle className="text-green-400" size={20} />;
    if (phase > 1) return <Play className="text-blue-400" size={20} />;
    return <Clock className="text-gray-400" size={20} />;
  };

  const getStatusColor = (phase, total) => {
    if (phase >= total) return "text-green-400";
    if (phase > 1) return "text-blue-400";
    return "text-gray-400";
  };

  // Helper to safely get icon
  // Note: we don't import icons dynamically here easily without map, 
  // but we can just use a default or reuse the iconMap if we move it to a shared util.
  // For now, simpler:
  const DefaultIcon = Code;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-screen bg-[#050B12]"
    >
      <TopBar />

      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="flex items-center gap-2 text-neon hover:text-neon/80 transition-colors">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neon mb-2">My Lab</h1>
          <p className="text-gray-400 text-lg">Track your project progress and continue where you left off</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading Mission Control...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace, index) => {
              const progress = Math.round(((workspace.current_phase - 1) / workspace.total_phases) * 100);
              const status = workspace.current_phase > workspace.total_phases ? "completed" : "in-progress";

              return (
                <motion.div
                  key={workspace.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 group relative"
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm("Delete this project?")) {
                        fetch(`http://localhost:8000/project/${workspace.id}`, { method: 'DELETE' })
                          .then(() => setWorkspaces(prev => prev.filter(p => p.id !== workspace.id)));
                      }
                    }}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-500 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                    title="Delete Project"
                  >
                    <Trash2 size={16} />
                  </button>

                  <Link to={`/project/${workspace.id}`} className="block">
                    {/* ... Existing Card Content ... */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* ... Icon and Title ... */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${workspace.color || 'from-blue-500 to-cyan-600'} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <DefaultIcon size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 pr-8">
                          <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                            {workspace.title}
                          </h3>
                          {getStatusIcon(workspace.current_phase, workspace.total_phases)}
                        </div>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{workspace.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${getStatusColor(workspace.current_phase, workspace.total_phases)}`}>
                          {status === "completed" ? "Completed" : "In Progress"}
                        </span>
                        <span className="text-xs text-gray-500">Phase {Math.min(workspace.current_phase, workspace.total_phases)}/{workspace.total_phases}</span>
                      </div>

                      <div className="w-full bg-slate-700/50 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${status === "completed" ? "bg-green-500" : "bg-blue-500"
                            }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{progress}% Complete</span>
                        <span>Last updated: just now</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {(workspace.tech || (workspace.tech_stack ? workspace.tech_stack.split(',') : [])).slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-slate-600/50 rounded text-xs text-gray-300"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>

                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}


        {
          workspaces.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Code size={64} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No workspaces yet</h3>
              <p className="text-gray-500 mb-6">Start your first project from the Project Lab</p>
              <Link
                to="/project-lab"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
              >
                <Globe size={20} />
                Explore Projects
              </Link>
            </motion.div>
          )
        }
      </div >
    </motion.div >
  );
}