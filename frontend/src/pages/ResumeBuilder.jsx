import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, FileText, Briefcase, Download, CheckCircle, Mail, Phone, MapPin, Linkedin } from "lucide-react";
import axios from "axios";
// Import html2pdf dynamically or assume it's available via NPM import if using bundler
import html2pdf from 'html2pdf.js';

export default function ResumeBuilder() {
    const [jobDescription, setJobDescription] = useState("");
    const [generating, setGenerating] = useState(false);
    const [exporting, setExporting] = useState(false); // New state for export loading
    const [resumeData, setResumeData] = useState(null);
    const resumeRef = useRef(null);

    const handleGenerate = async () => {
        if (!jobDescription.trim()) return;
        setGenerating(true);
        try {
            const res = await axios.post("http://localhost:8000/resume/build", {
                job_description: jobDescription
            });
            setResumeData(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to generate resume. Ensure backend is running.");
        } finally {
            setGenerating(false);
        }
    };

    const handleExportPDF = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-[#050B12] text-gray-200 flex flex-col font-sans">
            <style>{`
                @media print {
                    @page { margin: 0; size: A4; }
                    body { 
                        margin: 0; 
                        padding: 0; 
                        -webkit-print-color-adjust: exact; 
                    }
                    /* Hide everything by default */
                    body * {
                        visibility: hidden;
                    }
                    /* Only show the print container and its children */
                    .print-container, .print-container * {
                        visibility: visible;
                    }
                    /* Position the print container at the absolute top-left of the paper */
                    .print-container { 
                        position: absolute !important; 
                        top: 0 !important; 
                        left: 0 !important; 
                        width: 210mm !important; 
                        min-height: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white; 
                        z-index: 99999; 
                    }
                    
                    /* Ensure background graphics print */
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

                    /* Prevent awkward breaks */
                    .avoid-break {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                }
            `}</style>

            {/* Header */}
            <div className="p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-20 no-print">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/career-guidance" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                            <ArrowLeft className="text-gray-400" size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FileText className="text-purple-400" />
                            Resume Architect AI
                        </h1>
                    </div>
                    {resumeData && (
                        <button
                            onClick={handleExportPDF}
                            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Download size={18} /> Save as PDF
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* LEFT: Input & Context */}
                <div className="space-y-6 no-print">
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Briefcase className="text-purple-400" />
                            <h2 className="text-xl font-bold text-white">Target Job</h2>
                        </div>
                        <p className="text-gray-400 text-sm mb-4">
                            Paste the job description or company name here. The AI will analyze your completed Sentinel projects and build a tailored resume.
                        </p>
                        <textarea
                            className="w-full bg-gray-950/50 border border-gray-700 rounded-xl p-4 text-gray-200 focus:border-purple-500 outline-none transition-all h-48 resize-none font-mono text-sm"
                            placeholder="Example: Software Engineer at Google. Needs React, Python, and Cloud experience..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={generating || !jobDescription}
                            className={`w-full mt-4 btn-primary py-4 flex items-center justify-center gap-2 ${generating ? "opacity-50 cursor-not-allowed" : ""}`}
                            style={{ backgroundImage: "linear-gradient(to right, #8b5cf6, #d946ef)" }}
                        >
                            {generating ? (
                                <span className="animate-pulse">Architecting Resume...</span>
                            ) : (
                                <>
                                    <Sparkles size={18} /> Build My Resume
                                </>
                            )}
                        </button>
                    </div>

                    <div className="bg-blue-900/10 border border-blue-800/30 rounded-2xl p-6">
                        <h3 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
                            <CheckCircle size={16} /> Sentinel Advantage
                        </h3>
                        <p className="text-sm text-blue-400/80">
                            This AI automatically cites your **Project Lab** and **My Lab** work, converting your code contributions into professional "STAR" bullet points.
                        </p>
                    </div>
                </div>

                {/* RIGHT: Resume Preview (A4 Container) */}
                <div className="flex justify-center bg-gray-800/50 p-4 rounded-xl overflow-auto print:p-0 print:bg-white print-container">
                    {!resumeData ? (
                        <div className="w-[210mm] h-[297mm] bg-white flex flex-col items-center justify-center text-gray-400 shadow-xl scale-[0.8] origin-top">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <FileText size={40} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-500 mb-2">Resume Preview</h3>
                            <p className="max-w-md text-center text-sm">Enter a job description to see your A4 resume here.</p>
                        </div>
                    ) : (
                        /* A4 Resume Container with CSS Gradient Background for Sidebar consistency across pages */
                        <div
                            className="relative w-[210mm] min-h-[297mm] bg-white shadow-2xl text-gray-800 print:shadow-none print:w-full print:min-h-screen"
                            style={{
                                background: "linear-gradient(to right, #E5E7EB 32%, white 32%)",
                                printColorAdjust: "exact"
                            }}
                        >
                            {/* Visual Page Break Marker (Approximate for visual guide only) */}
                            <div className="absolute top-[296mm] left-0 w-full border-b-2 border-red-400 border-dashed opacity-50 pointer-events-none no-print">
                                <span className="absolute right-0 bottom-1 text-xs text-red-500 font-bold bg-white px-1">End of Page 1</span>
                            </div>

                            {/* Top Accent */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-[#F5D00E] z-10 print:fixed print:top-0"></div>

                            <div className="flex flex-row h-full"> {/* Flex container for layout structure */}

                                {/* LEFT SIDEBAR (Transparent bg because parent handles it) */}
                                <div className="w-[32%] pt-10 pb-8 px-6 flex flex-col gap-6 border-r border-gray-300/50">
                                    {/* Profile Image Placeholder */}
                                    <div className="flex justify-center">
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-400 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-md">
                                            {resumeData.personal_details?.name ? resumeData.personal_details.name[0] : "U"}
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="mt-4">
                                        <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-400 pb-1 mb-3 text-gray-700">Contact</h3>
                                        <div className="flex flex-col gap-3 text-[13px] text-gray-700">
                                            {resumeData.personal_details?.email && (
                                                <div className="flex items-center gap-2 break-words">
                                                    <Mail size={14} className="shrink-0" /> <span className="break-all">{resumeData.personal_details.email}</span>
                                                </div>
                                            )}
                                            {resumeData.personal_details?.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="shrink-0" /> <span>{resumeData.personal_details.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-400 pb-1 mb-3 text-gray-700">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {resumeData.skills_section?.map((skill, i) => (
                                                <span key={i} className="text-[11px] bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Education */}
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-400 pb-1 mb-3 text-gray-700">Education</h3>
                                        <div className="flex flex-col gap-4">
                                            {resumeData.education_section?.map((edu, i) => (
                                                <div key={i}>
                                                    <div className="font-bold text-[12px] text-gray-900">{edu.degree}</div>
                                                    <div className="text-[11px] text-gray-700">{edu.university}</div>
                                                    <div className="text-[11px] text-gray-600 italic">{edu.year}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT CONTENT */}
                                <div className="w-[68%] pt-10 pb-8 px-8 flex flex-col gap-6">
                                    {/* Header */}
                                    <div>
                                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 uppercase tracking-tight leading-none">
                                            {resumeData.personal_details?.name || "Your Name"}
                                        </h1>
                                        <h2 className="text-lg text-gray-500 tracking-widest uppercase mt-2">
                                            {jobDescription.split(' ').slice(0, 2).join(' ') || "Professional"}
                                        </h2>
                                        <div className="w-16 h-1 bg-gray-800 mt-4"></div>
                                    </div>

                                    {/* Profile Summary */}
                                    <div className="mb-2">
                                        <h3 className="text-md font-bold uppercase tracking-widest text-gray-800 mb-2">Career Objective</h3>
                                        <p className="text-[13px] leading-relaxed text-gray-700 text-justify">
                                            {resumeData.summary}
                                        </p>
                                    </div>

                                    {/* Experience */}
                                    {resumeData.experience_section && resumeData.experience_section.length > 0 && (
                                        <div>
                                            <h3 className="text-md font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-3">Experience</h3>
                                            <div className="space-y-4">
                                                {resumeData.experience_section.map((exp, i) => (
                                                    <div key={i}>
                                                        <div className="flex justify-between items-baseline">
                                                            <h4 className="font-bold text-[14px] text-gray-900">{exp.role}</h4>
                                                            <span className="text-[12px] text-gray-500 font-medium whitespace-nowrap ml-2">{exp.duration}</span>
                                                        </div>
                                                        <div className="text-[13px] text-gray-700 italic mb-1">{exp.company}</div>
                                                        <p className="text-[13px] text-gray-600 leading-snug">{exp.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Academic / Sentinel Projects */}
                                    <div>
                                        <h3 className="text-md font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-3">Projects</h3>
                                        <div className="space-y-4">
                                            {resumeData.projects_section?.map((proj, i) => (
                                                <div key={i}>
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h4 className="font-bold text-[14px] text-gray-900">{proj.title}</h4>
                                                        <span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200">Sentinel</span>
                                                    </div>
                                                    <ul className="list-disc list-outside ml-4 space-y-1">
                                                        {proj.bullets?.map((bullet, j) => (
                                                            <li key={j} className="text-[13px] text-gray-700 pl-1 leading-snug">{bullet}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
