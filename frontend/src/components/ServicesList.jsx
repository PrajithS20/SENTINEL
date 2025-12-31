// ServicesList.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Upload,
  MessageCircle,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Briefcase,
  Map
} from "lucide-react";

const services = [
  {
    title: "Resume Upload & Analysis",
    description: "Upload your resume for AI-powered analysis and optimization suggestions",
    icon: Upload,
    path: "/upload-resume",
    color: "from-cyan-500 to-blue-600",
    bgColor: "from-cyan-500/10 to-blue-500/10",
    hoverColor: "hover:shadow-cyan-500/20"
  },
  {
    title: "Career Chatbot",
    description: "Get personalized career advice from our AI assistant",
    icon: MessageCircle,
    path: "/career-chatbot",
    color: "from-purple-500 to-pink-600",
    bgColor: "from-purple-500/10 to-pink-500/10",
    hoverColor: "hover:shadow-purple-500/20"
  },
  {
    title: "Learning Resources",
    description: "Access comprehensive guides, tutorials, and templates",
    icon: BookOpen,
    path: "/resources",
    color: "from-green-500 to-emerald-600",
    bgColor: "from-green-500/10 to-emerald-500/10",
    hoverColor: "hover:shadow-green-500/20"
  },
  {
    title: "Project Lab",
    description: "Explore hands-on projects and development tools",
    icon: TrendingUp,
    path: "/project-lab",
    color: "from-orange-500 to-red-600",
    bgColor: "from-orange-500/10 to-red-500/10",
    hoverColor: "hover:shadow-orange-500/20"
  },
  {
    title: "Job Hub",
    description: "Find job opportunities and career connections",
    icon: Briefcase,
    path: "/job-hub",
    color: "from-indigo-500 to-purple-600",
    bgColor: "from-indigo-500/10 to-purple-500/10",
    hoverColor: "hover:shadow-indigo-500/20"
  },
  {
    title: "Offline Atlas",
    description: "Navigate your career path with our offline resources",
    icon: Map,
    path: "/offline-atlas",
    color: "from-teal-500 to-cyan-600",
    bgColor: "from-teal-500/10 to-cyan-500/10",
    hoverColor: "hover:shadow-teal-500/20"
  },
  {
    title: "Community Network",
    description: "Connect with mentors and fellow professionals",
    icon: Users,
    path: "/community",
    color: "from-rose-500 to-pink-600",
    bgColor: "from-rose-500/10 to-pink-500/10",
    hoverColor: "hover:shadow-rose-500/20"
  },
  {
    title: "Skill Certifications",
    description: "Earn recognized certifications for your skills",
    icon: Award,
    path: "/certifications",
    color: "from-amber-500 to-orange-600",
    bgColor: "from-amber-500/10 to-orange-500/10",
    hoverColor: "hover:shadow-amber-500/20"
  }
];

export default function ServicesList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {services.map((service, index) => (
        <motion.div
          key={service.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="group"
        >
          <Link to={service.path} className="block">
            <div className={`card p-6 h-full bg-gradient-to-br ${service.bgColor} border border-white/10 backdrop-blur-sm hover:shadow-glow ${service.hoverColor} transition-all duration-300 hover:border-white/20`}>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <service.icon size={24} className="text-white" />
              </div>

              <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">
                {service.title}
              </h3>

              <p className="text-gray-300 text-sm leading-relaxed">
                {service.description}
              </p>

              <div className="mt-4 flex items-center text-cyan-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Explore
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}