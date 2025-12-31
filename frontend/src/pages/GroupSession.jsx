import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, Zap, Globe } from 'lucide-react';
import axios from 'axios';

export default function GroupSession() {
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState(null);

    const handleJoin = async () => {
        if (!joinCode || joinCode.length !== 6) {
            setError("Please enter a valid 6-digit code.");
            return;
        }
        setIsJoining(true);
        setError(null);
        try {
            const res = await axios.post("http://localhost:8000/session/join", { code: joinCode });
            // Redirect to the Foundry with that Project ID
            navigate(`/my-lab/foundry/${res.data.project_id}`);
        } catch (err) {
            setError("Invalid Code or Session Expired.");
        }
        setIsJoining(false);
    };

    const handleStartNew = async () => {
        // Start a fresh generic collaborative project
        const demoProject = {
            title: "Team Collaboration " + new Date().toLocaleTimeString(),
            tech_stack: "Python",
            description: "Real-time collaborative workspace"
        };
        try {
            const res = await axios.post("http://localhost:8000/project/start", demoProject);
            // Then create a session for it
            const projId = res.data.project.id;
            navigate(`/my-lab/foundry/${projId}?session=new`);
        } catch (err) {
            alert("Failed to create session.");
        }
    };

    return (
        <div className="p-8 h-full bg-black min-h-screen text-gray-200 font-sans">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    <Users className="text-cyan-500" size={32} /> Sync & Collaborate
                </h1>
                <p className="text-gray-400 mb-12 text-lg">Work together in real-time. Join a squad or lead one.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* JOIN CARD */}
                    <div className="bg-[#0a111e] border border-gray-800 p-8 rounded-2xl relative hover:border-cyan-500/50 transition-all group">
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-cyan-900/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                            <Globe size={20} className="text-cyan-400" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-4">Join a Session</h2>
                        <p className="text-gray-400 mb-6 text-sm">Enter the 6-digit access code provided by your team lead.</p>

                        <div className="space-y-4">
                            <input
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                placeholder="e.g. 592812"
                                maxLength={6}
                                className="w-full bg-black border border-gray-700 p-4 text-center text-2xl tracking-[0.5em] font-mono rounded-lg focus:outline-none focus:border-cyan-500 transition-colors text-white uppercase placeholder-gray-800"
                            />
                            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                            <button
                                onClick={handleJoin}
                                disabled={isJoining}
                                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isJoining ? "CONNECTING..." : "ENTER WORKSPACE"}
                            </button>
                        </div>
                    </div>

                    {/* CREATE CARD */}
                    <div className="bg-[#0a111e] border border-gray-800 p-8 rounded-2xl relative hover:border-green-500/50 transition-all group opacity-80 hover:opacity-100">
                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center border border-green-500/30">
                            <Zap size={20} className="text-green-400" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-4">Start New Session</h2>
                        <p className="text-gray-400 mb-6 text-sm">Spin up a fresh collaborative project environment and invite others.</p>

                        <div className="h-24 flex items-center justify-center text-gray-600 italic border-2 border-dashed border-gray-800 rounded-lg mb-6 bg-black/50">
                            Instant Environment Provisioning...
                        </div>

                        <button
                            onClick={handleStartNew}
                            className="w-full py-4 border border-green-600 text-green-500 hover:bg-green-600 hover:text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            LAUNCH NEW SERVER <ArrowRight size={18} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
