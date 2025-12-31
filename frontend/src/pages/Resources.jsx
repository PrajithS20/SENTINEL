// Resources.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Video,
  FileText,
  Users,
  Award,
  ArrowLeft,
  ExternalLink
} from "lucide-react";

const resources = [
  {
    category: "Learning Materials",
    icon: BookOpen,
    items: [
      { title: "Resume Writing Guide", type: "PDF", link: "#" },
      { title: "Interview Preparation", type: "Video Course", link: "#" },
      { title: "Career Development Roadmap", type: "Interactive Guide", link: "#" },
    ]
  },
  {
    category: "Video Tutorials",
    icon: Video,
    items: [
      { title: "LinkedIn Optimization", type: "Video", link: "#" },
      { title: "Networking Strategies", type: "Video", link: "#" },
      { title: "Skill Assessment Tests", type: "Interactive", link: "#" },
    ]
  },
  {
    category: "Templates",
    icon: FileText,
    items: [
      { title: "Resume Templates", type: "Download", link: "#" },
      { title: "Cover Letter Templates", type: "Download", link: "#" },
      { title: "Portfolio Templates", type: "Download", link: "#" },
    ]
  },
  {
    category: "Community",
    icon: Users,
    items: [
      { title: "Mentorship Program", type: "Join", link: "#" },
      { title: "Career Forums", type: "Access", link: "#" },
      { title: "Alumni Network", type: "Connect", link: "#" },
    ]
  },
  {
    category: "Certifications",
    icon: Award,
    items: [
      { title: "Technical Skills Assessment", type: "Certification", link: "#" },
      { title: "Soft Skills Evaluation", type: "Certification", link: "#" },
      { title: "Industry Recognition", type: "Badge", link: "#" },
    ]
  }
];

export default function Resources() {
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

        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-neon mb-4 text-center">Resources Offered by Us</h1>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Access our comprehensive collection of career development resources, learning materials,
            and tools designed to accelerate your professional growth.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-neon/10 rounded-lg">
                    <category.icon className="text-neon" size={24} />
                  </div>
                  <h2 className="text-xl font-semibold">{category.category}</h2>
                </div>

                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index * 0.1) + (itemIndex * 0.05) }}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors group cursor-pointer"
                    >
                      <div>
                        <h3 className="font-medium text-sm">{item.title}</h3>
                        <p className="text-xs text-gray-400">{item.type}</p>
                      </div>
                      <ExternalLink size={16} className="text-gray-400 group-hover:text-neon transition-colors" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <div className="card p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold mb-4">Need More Help?</h3>
              <p className="text-gray-400 mb-6">
                Can't find what you're looking for? Our career advisors are here to help you navigate your professional journey.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/career-chatbot" className="btn-primary">
                  Chat with Advisor
                </Link>
                <Link to="/project-lab" className="btn-secondary">
                  Explore Projects
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}