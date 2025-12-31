import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import LoginSignup from "./pages/LoginSignup";
import Dashboard from "./pages/Dashboard";
import ProjectLab from "./pages/ProjectLab";
import UploadResume from "./pages/UploadResume";
import CareerChatbot from "./pages/CareerChatbot";
import Resources from "./pages/Resources";
import OfflineAtlas from "./pages/OfflineAtlas";
import JobHub from "./pages/JobHub";
import MyWorkspace from "./pages/MyWorkspace";
import MyWorkspaceOverview from "./pages/MyWorkspaceOverview";
import GroupSession from "./pages/GroupSession";
import MyLearning from "./pages/MyLearning";
import ProjectPhases from "./pages/ProjectPhases";
import TheFoundry from "./pages/TheFoundry";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user is authenticated on app start
    return localStorage.getItem("authToken") !== null;
  });

  const handleLogin = () => {
    // Set authentication state and store token
    localStorage.setItem("authToken", "demo-token");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Clear authentication state and remove token
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <LoginSignup onLogin={handleLogin} />
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-[#050B12] text-gray-200">
        <Sidebar onLogout={handleLogout} />
        <div className="flex-1 overflow-y-auto relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/project-lab" element={<ProjectLab />} />
            <Route path="/my-lab" element={<MyWorkspaceOverview />} />
            <Route path="/collaborate" element={<GroupSession />} />
            <Route path="/upload-resume" element={<UploadResume />} />
            <Route path="/career-chatbot" element={<CareerChatbot />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/offline-atlas" element={<OfflineAtlas />} />
            <Route path="/job-hub" element={<JobHub />} />
            <Route path="/project/:projectId" element={<ProjectPhases />} />
            <Route path="/project/:projectId/foundry" element={<TheFoundry />} />
            <Route path="/workspace/:projectId" element={<MyWorkspace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
