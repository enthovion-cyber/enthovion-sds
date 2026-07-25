"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Library,
  FilePlus,
  Upload,
  MessageSquare,
  Bot,
  BookOpen,
  FileCode2,
  ShieldCheck,
  Scale,
  FlaskConical,
  CheckCircle2,
  Tag,
  History,
  Terminal,
  Settings,
  Sun,
  Moon,
  Search,
  Bell,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  Zap,
  Filter,
  ArrowUpRight,
  RefreshCw,
  SlidersHorizontal,
  X,
  Menu,
  Check,
  Globe,
  Database,
  Lock,
  Download,
  Share2,
  ChevronDown,
  Layers,
  Cpu,
  BarChart3,
  ExternalLink,
  ShieldAlert,
  Flame,
  CheckSquare,
  Send
} from "lucide-react";

// ==========================================
// COLOR PALETTE & DESIGN SYSTEM
// Deep Navy: #071A33
// Dark Base: #020617
// Dark Surface: #0F172A
// Electric Blue: #2563FF
// Compliance Blue: #1D4ED8
// Chemical Cyan: #00B8D9
// Success Green: #16A34A
// Warning Amber: #F59E0B
// Danger Red: #DC2626
// Draft Violet: #7C3AED
// Slate Gray: #64748B
// ==========================================

// TYPES
type NavTab =
  | "dashboard"
  | "sds-library"
  | "generate-sds"
  | "upload-sds"
  | "sds-chatbot"
  | "copilot"
  | "sop-library"
  | "generate-sop"
  | "compliance"
  | "regulatory"
  | "mixture"
  | "validation"
  | "label"
  | "version-control"
  | "pipeline-console"
  | "settings"
  | "landing-page";

interface SDSDocument {
  id: string;
  title: string;
  casNumber: string;
  revision: string;
  ghsClassification: string;
  status: "Compliant" | "Expiring Soon" | "Draft" | "Action Required";
  healthScore: number;
  lastUpdated: string;
  format: "GHS v8" | "OSHA HAZCOM" | "REACH EU";
  riskLevel: "High" | "Medium" | "Low";
}

interface PipelineJob {
  id: string;
  chemicalName: string;
  stage: "Parsing" | "Extraction" | "GHS Mapping" | "Validation" | "Complete";
  progress: number;
  timeRemaining: string;
}

// MOCK DATA
const MOCK_SDS_DOCS: SDSDocument[] = [
  {
    id: "SDS-2026-0891",
    title: "Tetrahydrofuran (THF) Ultra-Pure",
    casNumber: "109-99-9",
    revision: "v4.2.1",
    ghsClassification: "Flam. Liq. 2, Eye Irrit. 2, Carc. 2",
    status: "Compliant",
    healthScore: 98,
    lastUpdated: "2026-07-22",
    format: "REACH EU",
    riskLevel: "High"
  },
  {
    id: "SDS-2026-0842",
    title: "Dimethyl Sulfoxide (DMSO)",
    casNumber: "67-68-5",
    revision: "v2.1.0",
    ghsClassification: "Skin Irrit. 2, Eye Irrit. 2B",
    status: "Expiring Soon",
    healthScore: 74,
    lastUpdated: "2023-08-10",
    format: "OSHA HAZCOM",
    riskLevel: "Medium"
  },
  {
    id: "SDS-2026-0775",
    title: "Acetonitrile Analytical Grade",
    casNumber: "75-05-8",
    revision: "v5.0.0",
    ghsClassification: "Flam. Liq. 2, Acute Tox. 4",
    status: "Compliant",
    healthScore: 99,
    lastUpdated: "2026-07-20",
    format: "GHS v8",
    riskLevel: "High"
  },
  {
    id: "SDS-2026-0610",
    title: "Sodium Hydroxide 50% Solution",
    casNumber: "1310-73-2",
    revision: "v1.4.3",
    ghsClassification: "Skin Corr. 1A, Met. Corr. 1",
    status: "Action Required",
    healthScore: 52,
    lastUpdated: "2022-11-04",
    format: "OSHA HAZCOM",
    riskLevel: "High"
  },
  {
    id: "SDS-2026-0599",
    title: "Isopropyl Alcohol 99.9%",
    casNumber: "67-63-0",
    revision: "v3.8.0",
    ghsClassification: "Flam. Liq. 2, STOT SE 3",
    status: "Compliant",
    healthScore: 95,
    lastUpdated: "2026-06-15",
    format: "GHS v8",
    riskLevel: "Medium"
  },
  {
    id: "SDS-2026-0412",
    title: "Enthovion Compound Poly-X7",
    casNumber: "Mixture-09",
    revision: "v0.9.1-beta",
    ghsClassification: "Pending Auto-Classification",
    status: "Draft",
    healthScore: 68,
    lastUpdated: "2026-07-24",
    format: "REACH EU",
    riskLevel: "Low"
  }
];

const MOCK_PIPELINE: PipelineJob[] = [
  {
    id: "PIPE-901",
    chemicalName: "Lithium Hexafluorophosphate Electrolyte",
    stage: "GHS Mapping",
    progress: 68,
    timeRemaining: "12s"
  },
  {
    id: "PIPE-902",
    chemicalName: "Polyethylene Glycol Monomethyl Ether",
    stage: "Validation",
    progress: 92,
    timeRemaining: "4s"
  },
  {
    id: "PIPE-903",
    chemicalName: "Propylene Carbonate Battery Grade",
    stage: "Parsing",
    progress: 25,
    timeRemaining: "35s"
  }
];

export default function EnthovionSDSDashboard() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [copilotOpen, setCopilotOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copilotMessages, setCopilotMessages] = useState<
    Array<{ sender: "user" | "ai"; text: string }>
  >([
    {
      sender: "ai",
      text: "Hello! I am Enthovion AI Copilot. How can I assist you with GHS classifications, ECHA REACH Annex II revisions, or SOP drafting today?"
    }
  ]);
  const [chatInput, setChatInput] = useState("");

  const filteredDocs = useMemo(() => {
    return MOCK_SDS_DOCS.filter(
      (doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.casNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setCopilotMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setTimeout(() => {
      setCopilotMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Analyzed query regarding "${userMsg}". Enthovion AI indicates compliance verification complete. Updated GHS Revision 8 hazard statements are verified across OSHA, ECHA, and K-REACH frameworks.`
        }
      ]);
    }, 800);
  };

  const navItems = [
    {
      group: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "sds-library", label: "SDS Library", icon: Library },
        { id: "pipeline-console", label: "Pipeline Console", icon: Terminal }
      ]
    },
    {
      group: "SDS Authoring",
      items: [
        { id: "generate-sds", label: "Generate SDS", icon: FilePlus },
        { id: "upload-sds", label: "Upload & AI Parse", icon: Upload },
        { id: "mixture", label: "Mixture Calculation", icon: FlaskConical },
        { id: "label", label: "GHS Label Engine", icon: Tag },
        { id: "version-control", label: "Version Control", icon: History }
      ]
    },
    {
      group: "Intelligence & SOP",
      items: [
        { id: "sds-chatbot", label: "SDS Chatbot", icon: MessageSquare },
        { id: "copilot", label: "AI Copilot Workspace", icon: Bot },
        { id: "sop-library", label: "SOP Library", icon: BookOpen },
        { id: "generate-sop", label: "Generate SOP", icon: FileCode2 }
      ]
    },
    {
      group: "Compliance & Audit",
      items: [
        { id: "compliance", label: "Compliance Health", icon: ShieldCheck },
        { id: "regulatory", label: "Regulatory Matrix", icon: Scale },
        { id: "validation", label: "Auto Validation", icon: CheckCircle2 }
      ]
    },
    {
      group: "Enterprise",
      items: [
        { id: "settings", label: "Settings & API", icon: Settings },
        { id: "landing-page", label: "Public Product Page", icon: Globe }
      ]
    }
  ];

  return (
    <div
      className={`${
        darkMode
          ? "bg-[#020617] text-slate-100 dark"
          : "bg-slate-50 text-slate-900"
      } min-h-screen font-sans flex flex-col transition-colors duration-200 selection:bg-[#2563FF] selection:text-white`}
    >
      {/* STICKY TOPBAR */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-800/80 bg-[#071A33]/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563FF] via-[#00B8D9] to-[#7C3AED] p-[2px]">
              <div className="w-full h-full bg-[#020617] rounded-[10px] flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-[#00B8D9]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                ENTHOVION <span className="text-[#00B8D9] text-xs px-1.5 py-0.5 rounded border border-[#00B8D9]/30 bg-[#00B8D9]/10 ml-1 font-mono">SDS</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider -mt-1 uppercase">
                Enterprise Chemical Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* TOPBAR CENTER SEARCH */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search CAS, Chemical Name, SDS ID, Regulatory Annex..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full bg-[#0F172A]/80 border border-slate-700/60 focus:border-[#2563FF] focus:outline-none focus:ring-1 focus:ring-[#2563FF] text-slate-200 placeholder-slate-500 transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
              ⌘K
            </span>
          </div>
        </div>

        {/* TOPBAR RIGHT ACTIONS */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCopilotOpen(!copilotOpen)}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              copilotOpen
                ? "bg-[#2563FF]/20 border-[#2563FF] text-[#00B8D9]"
                : "border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00B8D9]" />
            <span>AI Copilot</span>
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full border border-slate-700/60 bg-[#0F172A]/80 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          <button className="relative p-2 rounded-full border border-slate-700/60 bg-[#0F172A]/80 text-slate-300 hover:text-white hover:bg-slate-800 transition">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
          </button>

          <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563FF] to-[#7C3AED] flex items-center justify-center font-semibold text-xs text-white shadow-md">
              EV
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200">Enthovion Global Bio</span>
              <span className="text-[10px] text-slate-400 font-mono">Enterprise Tier</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800/80 bg-[#071A33]/40 p-4 shrink-0 overflow-y-auto">
          <div className="space-y-6">
            {navItems.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <div className="px-3 text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold mb-2">
                  {group.group}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as NavTab)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition group ${
                        isActive
                          ? "bg-gradient-to-r from-[#2563FF] to-[#1D4ED8] text-white shadow-lg shadow-blue-500/20"
                          : "text-slate-400 hover:text-slate-100 hover:bg-[#0F172A]/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-[#00B8D9]"}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-800/80">
            <div className="p-3 rounded-xl bg-gradient-to-b from-[#0F172A] to-[#071A33] border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-slate-400">GHS Auto-Engine</span>
                <span className="text-[#16A34A] text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping" />
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">REACH Annex II 2026/878 compliant</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#00B8D9] h-full w-[94%]" />
              </div>
            </div>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="w-72 bg-[#071A33] h-full border-r border-slate-800 p-4 flex flex-col overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-[#00B8D9]" />
                    <span className="font-bold text-sm tracking-wide text-white">ENTHOVION SDS</span>
                  </div>
                  <button onClick={() => setMobileDrawerOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-6 flex-1">
                  {navItems.map((group, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="px-3 text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold mb-2">
                        {group.group}
                      </div>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id as NavTab);
                              setMobileDrawerOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                              isActive ? "bg-[#2563FF] text-white" : "text-slate-400 hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WORKSPACE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* CONTENT ROUTER */}
          {activeTab === "dashboard" && (
            <DashboardView
              docs={filteredDocs}
              pipeline={MOCK_PIPELINE}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "sds-library" && <SdsLibraryView docs={filteredDocs} />}
          {activeTab === "generate-sds" && <GenerateSdsView />}
          {activeTab === "upload-sds" && <UploadSdsView />}
          {activeTab === "sds-chatbot" && <SdsChatbotView />}
          {activeTab === "copilot" && <CopilotWorkspaceView />}
          {activeTab === "sop-library" && <SopLibraryView />}
          {activeTab === "generate-sop" && <GenerateSopView />}
          {activeTab === "compliance" && <ComplianceHealthView />}
          {activeTab === "regulatory" && <RegulatoryMatrixView />}
          {activeTab === "mixture" && <MixtureCalculationView />}
          {activeTab === "validation" && <AutoValidationView />}
          {activeTab === "label" && <LabelEngineView />}
          {activeTab === "version-control" && <VersionControlView />}
          {activeTab === "pipeline-console" && <PipelineConsoleView pipeline={MOCK_PIPELINE} />}
          {activeTab === "settings" && <SettingsView />}
          {activeTab === "landing-page" && <PublicLandingPageView setActiveTab={setActiveTab} />}
        </main>

        {/* AI SDS COPILOT SLIDE-OUT PANEL */}
        <AnimatePresence>
          {copilotOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden xl:flex flex-col border-l border-slate-800/80 bg-[#071A33]/60 backdrop-blur-sm shrink-0 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-[#071A33]">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#00B8D9]" />
                  <span className="font-semibold text-xs tracking-tight text-slate-100">AI SDS Copilot</span>
                  <span className="text-[10px] bg-[#2563FF]/20 text-[#00B8D9] border border-[#2563FF]/40 px-1.5 py-0.2 rounded font-mono">
                    v4.8
                  </span>
                </div>
                <button onClick={() => setCopilotOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
                {copilotMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl max-w-[90%] ${
                      msg.sender === "user"
                        ? "ml-auto bg-[#2563FF] text-white rounded-br-none"
                        : "bg-[#0F172A] border border-slate-800 text-slate-200 rounded-bl-none space-y-1"
                    }`}
                  >
                    {msg.sender === "ai" && (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#00B8D9] mb-1">
                        <Sparkles className="w-3 h-3" /> Enthovion Intelligence
                      </div>
                    )}
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* QUICK SUGGESTIONS */}
              <div className="px-3 py-2 border-t border-slate-800/60 bg-[#0F172A]/40 flex gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setChatInput("Audit REACH Annex II SDS compliance")}
                  className="whitespace-nowrap text-[10px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700"
                >
                  Audit REACH Annex II
                </button>
                <button
                  onClick={() => setChatInput("Recalculate Mixture Flashpoint")}
                  className="whitespace-nowrap text-[10px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700"
                >
                  Recalc Flashpoint
                </button>
              </div>

              {/* INPUT */}
              <div className="p-3 border-t border-slate-800/80 bg-[#071A33]">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Ask Copilot regarding hazard statements..."
                    className="w-full bg-[#0F172A] border border-slate-700/80 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#2563FF]"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="absolute right-1.5 p-1.5 rounded-lg bg-[#2563FF] text-white hover:bg-blue-600 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ==========================================
// SUB-VIEWS & MODULE COMPONENTS
// ==========================================

// 1. DASHBOARD VIEW
function DashboardView({
  docs,
  pipeline,
  setActiveTab
}: {
  docs: SDSDocument[];
  pipeline: PipelineJob[];
  setActiveTab: (t: NavTab) => void;
}) {
  return (
    <div className="space-y-6">
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Enterprise SDS Command Center
            <span className="text-[11px] bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40 px-2 py-0.5 rounded-full font-mono">
              Live Audited
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time chemical safety, GHS auto-classification & regulatory exposure monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("generate-sds")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#2563FF] to-[#1D4ED8] hover:from-blue-600 hover:to-blue-700 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition"
          >
            <FilePlus className="w-4 h-4" />
            <span>Generate New SDS</span>
          </button>
          <button
            onClick={() => setActiveTab("upload-sds")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F172A] border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold transition"
          >
            <Upload className="w-4 h-4 text-[#00B8D9]" />
            <span>Bulk AI Parse</span>
          </button>
        </div>
      </div>

      {/* PREMIUM KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total SDS Managed"
          value="1,482"
          subText="+12 this week"
          trend="up"
          icon={FileText}
          badgeColor="blue"
        />
        <KPICard
          title="Compliance Health Score"
          value="96.4%"
          subText="ECHA & OSHA Compliant"
          trend="up"
          icon={ShieldCheck}
          badgeColor="green"
        />
        <KPICard
          title="Expiring / Revisions Due"
          value="18"
          subText="Requires Section 9 Audit"
          trend="warning"
          icon={AlertTriangle}
          badgeColor="amber"
        />
        <KPICard
          title="AI Automated Hours Saved"
          value="3,840h"
          subText="Estimated $240k saved"
          trend="up"
          icon={Zap}
          badgeColor="cyan"
        />
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2 COLS) */}
        <div className="lg:col-span-2 space-y-6">
          {/* UNIFIED SDS PIPELINE PANEL */}
          <div className="p-4 rounded-xl bg-[#0F172A]/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#00B8D9]" />
                <h2 className="text-sm font-semibold text-slate-100">Live SDS Processing Pipeline</h2>
              </div>
              <button
                onClick={() => setActiveTab("pipeline-console")}
                className="text-xs text-[#2563FF] hover:underline flex items-center gap-1"
              >
                Console View <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {pipeline.map((job) => (
                <div key={job.id} className="p-3 rounded-lg bg-[#071A33]/80 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{job.chemicalName}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ETA: {job.timeRemaining} | Stage: <span className="text-[#00B8D9]">{job.stage}</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${job.progress}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-[#2563FF] to-[#00B8D9]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT SDS DOCUMENTS DATA TABLE */}
          <div className="p-4 rounded-xl bg-[#0F172A]/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Library className="w-4 h-4 text-[#2563FF]" />
                <h2 className="text-sm font-semibold text-slate-100">Active SDS Registry</h2>
              </div>
              <button
                onClick={() => setActiveTab("sds-library")}
                className="text-xs text-[#2563FF] hover:underline flex items-center gap-1"
              >
                View All {docs.length} <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Document & CAS</th>
                    <th className="py-2.5 px-3">GHS Hazard Summary</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Health</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {docs.slice(0, 5).map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{doc.title}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {doc.id} • CAS: {doc.casNumber}
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate text-slate-300">
                        {doc.ghsClassification}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold">
                        <span className={doc.healthScore > 80 ? "text-[#16A34A]" : "text-[#F59E0B]"}>
                          {doc.healthScore}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button className="p-1.5 rounded hover:bg-slate-700 text-slate-300">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1 COL) */}
        <div className="space-y-6">
          {/* COMPLIANCE HEALTH SCORE PANEL */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-[#0F172A] to-[#071A33] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Compliance Index
              </h3>
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">96.4</span>
              <span className="text-xs text-slate-400">/ 100 Grade A</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>OSHA HAZCOM 2012</span>
                <span className="text-[#16A34A] font-semibold">100%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>REACH Annex II 2026</span>
                <span className="text-[#16A34A] font-semibold">94.2%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>GHS Revision 8 Annexes</span>
                <span className="text-[#F59E0B] font-semibold">89.0%</span>
              </div>
            </div>
          </div>

          {/* RISK & EXPIRY INSIGHTS */}
          <div className="p-4 rounded-xl bg-[#0F172A]/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" /> Risk & Expiry Insights
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/30 text-slate-200">
                <div className="font-semibold text-[#DC2626] flex items-center justify-between">
                  <span>Sodium Hydroxide 50%</span>
                  <span className="text-[10px] font-mono">Action Needed</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Revision overdue by 120 days. Corrosive class 1A missing updated PPE directive.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-slate-200">
                <div className="font-semibold text-[#F59E0B] flex items-center justify-between">
                  <span>DMSO Solvents</span>
                  <span className="text-[10px] font-mono">30 Days Left</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pending Section 11 Toxicological recalculation based on updated ECHA guidance.
                </p>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS PANEL */}
          <div className="p-4 rounded-xl bg-[#0F172A]/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Instant Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab("mixture")}
                className="p-2.5 rounded-lg bg-[#071A33] border border-slate-700/80 hover:border-[#2563FF] text-left transition text-xs space-y-1"
              >
                <FlaskConical className="w-4 h-4 text-[#00B8D9]" />
                <div className="font-semibold text-slate-200">Calc Mixture</div>
              </button>
              <button
                onClick={() => setActiveTab("label")}
                className="p-2.5 rounded-lg bg-[#071A33] border border-slate-700/80 hover:border-[#2563FF] text-left transition text-xs space-y-1"
              >
                <Tag className="w-4 h-4 text-[#7C3AED]" />
                <div className="font-semibold text-slate-200">Print GHS Label</div>
              </button>
              <button
                onClick={() => setActiveTab("generate-sop")}
                className="p-2.5 rounded-lg bg-[#071A33] border border-slate-700/80 hover:border-[#2563FF] text-left transition text-xs space-y-1"
              >
                <FileCode2 className="w-4 h-4 text-[#16A34A]" />
                <div className="font-semibold text-slate-200">Draft Lab SOP</div>
              </button>
              <button
                onClick={() => setActiveTab("validation")}
                className="p-2.5 rounded-lg bg-[#071A33] border border-slate-700/80 hover:border-[#2563FF] text-left transition text-xs space-y-1"
              >
                <CheckCircle2 className="w-4 h-4 text-[#2563FF]" />
                <div className="font-semibold text-slate-200">Auto Validate</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. SDS LIBRARY VIEW
function SdsLibraryView({ docs }: { docs: SDSDocument[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">SDS Global Library</h1>
          <p className="text-xs text-slate-400">Searchable repository of all verified Safety Data Sheets.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F172A] border border-slate-700 text-xs text-slate-200">
            <Filter className="w-3.5 h-3.5" /> Filter Status
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563FF] text-white text-xs font-semibold">
            <Download className="w-3.5 h-3.5" /> Export PDF Archive
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="p-4 rounded-xl bg-[#0F172A]/80 border border-slate-800 hover:border-[#2563FF]/50 transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {doc.id}
                </span>
                <StatusBadge status={doc.status} />
              </div>
              <h3 className="font-bold text-sm text-slate-100">{doc.title}</h3>
              <p className="text-xs font-mono text-[#00B8D9]">CAS: {doc.casNumber}</p>
              <p className="text-xs text-slate-400 line-clamp-2">{doc.ghsClassification}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>{doc.format}</span>
              <span className="text-slate-200 font-semibold">{doc.revision}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. GENERATE SDS VIEW
function GenerateSdsView() {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGenerated(true);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">AI-Powered SDS Authoring Engine</h1>
        <p className="text-xs text-slate-400">
          Generate a 16-section GHS-compliant Safety Data Sheet from CAS numbers or proprietary chemical structures.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Chemical Name / Trade Name</label>
            <input
              type="text"
              defaultValue="Enthovion Catalyst Sol-9"
              className="w-full bg-[#071A33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">CAS / EC Index Number</label>
            <input
              type="text"
              defaultValue="7440-05-3"
              className="w-full bg-[#071A33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Target Framework Format</label>
            <select className="w-full bg-[#071A33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white">
              <option>REACH Annex II (EU 2026/878)</option>
              <option>OSHA HAZCOM 2012 (US)</option>
              <option>GHS Revision 8 (Global)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Language Standard</label>
            <select className="w-full bg-[#071A33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white">
              <option>English (US / EU Standard)</option>
              <option>German (DE - GefStoffV)</option>
              <option>Japanese (JIS Z 7253)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-[#2563FF] hover:bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Sparkles className="w-4 h-4 text-[#00B8D9]" />
          )}
          {loading ? "Synthesizing 16 Sections..." : "Generate AI Safety Data Sheet"}
        </button>
      </div>

      {generated && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-[#071A33] border border-[#16A34A]/50 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#16A34A] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> SDS Synthesis Complete (16 / 16 Sections)
            </span>
            <button className="px-3 py-1 bg-[#2563FF] text-white rounded text-xs">Download PDF</button>
          </div>
          <div className="text-xs font-mono text-slate-300 bg-[#020617] p-4 rounded-lg space-y-2 border border-slate-800">
            <p className="text-[#00B8D9]">SECTION 1: Identification of the Substance</p>
            <p>Product Identifier: Enthovion Catalyst Sol-9 | CAS: 7440-05-3</p>
            <p className="text-[#00B8D9] mt-2">SECTION 2: Hazards Identification</p>
            <p>Classification according to Regulation (EC) No 1272/2008 [CLP]: Flam. Sol. 1, Eye Irrit. 2</p>
            <p>Signal Word: DANGER | Hazard Statements: H228, H319</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// 4. UPLOAD SDS VIEW
function UploadSdsView() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Bulk AI Upload & Document Extraction</h1>
        <p className="text-xs text-slate-400">
          Drop legacy PDFs or images to auto-extract CAS, physical properties, and toxicological statements.
        </p>
      </div>

      <div className="border-2 border-dashed border-slate-700 hover:border-[#2563FF] rounded-xl p-10 text-center bg-[#0F172A]/50 transition space-y-4 cursor-pointer">
        <Upload className="w-10 h-10 text-[#00B8D9] mx-auto" />
        <div>
          <p className="text-sm font-semibold text-slate-200">
            Drag and drop legacy SDS PDF files here
          </p>
          <p className="text-xs text-slate-500 mt-1">Supports multi-page OCR and scanned documents</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700">
          Browse Computer
        </button>
      </div>
    </div>
  );
}

// 5. SDS CHATBOT VIEW
function SdsChatbotView() {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col rounded-xl bg-[#0F172A] border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-[#071A33] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#00B8D9]" />
          <span className="font-bold text-xs text-white">SDS Interactive Query Engine</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Scope: All 1,482 Enterprise SDS</span>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto font-sans text-xs">
        <div className="bg-[#071A33] border border-slate-800 p-3 rounded-xl max-w-md text-slate-300">
          Ask me questions like: &quot;What are the first-aid steps for Tetrahydrofuran exposure in Section 4?&quot;
        </div>
      </div>
      <div className="p-3 border-t border-slate-800 bg-[#071A33] flex gap-2">
        <input
          type="text"
          placeholder="Ask a question across all chemical documents..."
          className="flex-1 bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
        />
        <button className="px-4 py-2 bg-[#2563FF] text-white rounded-lg text-xs font-semibold">Query</button>
      </div>
    </div>
  );
}

// 6. COPILOT WORKSPACE VIEW
function CopilotWorkspaceView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">AI Copilot Deep Workspace</h1>
        <p className="text-xs text-slate-400">Interactive workspace for real-time GHS audit and multi-jurisdiction compliance.</p>
      </div>
      <div className="p-6 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-slate-300 space-y-4">
        <p>AI Copilot is actively analyzing regulatory changes across ECHA REACH, US OSHA, and China MEE.</p>
        <div className="p-4 bg-[#071A33] rounded-lg border border-slate-800 font-mono text-[11px] text-[#00B8D9]">
          [SYSTEM LOG]: Verified 12 hazardous classification updates. 0 conflicts detected in current inventory.
        </div>
      </div>
    </div>
  );
}

// 7. SOP LIBRARY VIEW
function SopLibraryView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Standard Operating Procedures (SOP)</h1>
        <p className="text-xs text-slate-400">Library of generated lab handling and hazardous waste disposal SOPs.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>SOP-LAB-012</span>
            <span className="text-[#16A34A]">Active</span>
          </div>
          <h3 className="font-bold text-sm text-white">Handling Volatile Solvents (THF / Acetonitrile)</h3>
          <p className="text-xs text-slate-400">Fume hood airflow requirements, glove degradation specs, spill response.</p>
        </div>
      </div>
    </div>
  );
}

// 8. GENERATE SOP VIEW
function GenerateSopView() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Generate Lab Handling SOP</h1>
        <p className="text-xs text-slate-400">Auto-derive operational safety procedures directly from target SDS hazard statements.</p>
      </div>
      <div className="p-6 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Select Source SDS</label>
          <select className="w-full bg-[#071A33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white">
            <option>Tetrahydrofuran (THF) Ultra-Pure (SDS-2026-0891)</option>
            <option>Sodium Hydroxide 50% Solution (SDS-2026-0610)</option>
          </select>
        </div>
        <button className="w-full py-2 bg-[#2563FF] text-white rounded-lg text-xs font-semibold">
          Auto-Generate Handling SOP
        </button>
      </div>
    </div>
  );
}

// 9. COMPLIANCE HEALTH VIEW
function ComplianceHealthView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Enterprise Compliance Health</h1>
        <p className="text-xs text-slate-400">Global regulatory audit scores and compliance breakdown.</p>
      </div>
      <div className="p-6 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white">Regulatory Coverage Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-[#071A33] rounded-lg border border-slate-800">
            <div className="text-slate-400">US OSHA HAZCOM</div>
            <div className="text-xl font-bold text-white mt-1">100%</div>
          </div>
          <div className="p-4 bg-[#071A33] rounded-lg border border-slate-800">
            <div className="text-slate-400">EU REACH Annex II</div>
            <div className="text-xl font-bold text-white mt-1">94.2%</div>
          </div>
          <div className="p-4 bg-[#071A33] rounded-lg border border-slate-800">
            <div className="text-slate-400">APAC GHS Rev 8</div>
            <div className="text-xl font-bold text-white mt-1">89.0%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 10. REGULATORY MATRIX VIEW
function RegulatoryMatrixView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Regulatory Matrix & Annex Tracker</h1>
        <p className="text-xs text-slate-400">Track real-time legal adjustments in chemical safety worldwide.</p>
      </div>
      <div className="p-6 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-slate-300">
        All active chemical inventories synced with ECHA SVHC list (Substances of Very High Concern).
      </div>
    </div>
  );
}

// 11. MIXTURE CALCULATION VIEW
function MixtureCalculationView() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">GHS Mixture Additivity Calculator</h1>
        <p className="text-xs text-slate-400">Calculate toxicity and flashpoints for complex multi-ingredient chemical mixtures.</p>
      </div>
      <div className="p-6 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4 text-xs">
        <div className="flex justify-between items-center font-semibold text-slate-200">
          <span>Ingredients Ratio</span>
          <button className="text-[#2563FF]">+ Add Substance</button>
        </div>
        <div className="p-3 bg-[#071A33] rounded-lg border border-slate-800 flex justify-between items-center">
          <span>Component A: Acetone (CAS 67-64-1)</span>
          <span className="font-mono text-[#00B8D9]">60.0%</span>
        </div>
        <div className="p-3 bg-[#071A33] rounded-lg border border-slate-800 flex justify-between items-center">
          <span>Component B: Water (CAS 7732-18-5)</span>
          <span className="font-mono text-[#00B8D9]">40.0%</span>
        </div>
        <button className="w-full py-2 bg-[#2563FF] text-white rounded-lg font-semibold">
          Calculate GHS Mixture Classification
        </button>
      </div>
    </div>
  );
}

// 12. AUTO VALIDATION VIEW
function AutoValidationView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Automated Validation Engine</h1>
        <p className="text-xs text-slate-400">Automated verification of hazard statements against mandatory signal words.</p>
      </div>
      <div className="p-6 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-[#16A34A] flex items-center gap-2">
        <CheckSquare className="w-5 h-5" /> All 1,482 SDS passed logic & symbol consistency validation.
      </div>
    </div>
  );
}

// 13. LABEL ENGINE VIEW
function LabelEngineView() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">GHS Secondary Container Label Generator</h1>
        <p className="text-xs text-slate-400">Print GHS compliant drum, bottle, and secondary container labels with pictograms.</p>
      </div>
      <div className="p-6 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4">
        <div className="p-4 bg-[#071A33] rounded-lg border-2 border-amber-500/50 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-white">DANGER: Tetrahydrofuran</span>
            <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold">FLAMMABLE</span>
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-10 border border-red-500 rotate-45 flex items-center justify-center p-1 bg-white">
              <Flame className="w-6 h-6 text-red-600 -rotate-45" />
            </div>
            <div className="w-10 h-10 border border-red-500 rotate-45 flex items-center justify-center p-1 bg-white">
              <ShieldAlert className="w-6 h-6 text-red-600 -rotate-45" />
            </div>
          </div>
          <p className="text-[10px] text-slate-300">
            H225: Highly flammable liquid and vapor. H319: Causes serious eye irritation.
          </p>
        </div>
        <button className="w-full py-2 bg-[#2563FF] text-white rounded-lg text-xs font-semibold">
          Print Label (Dymo / Zebra Standard)
        </button>
      </div>
    </div>
  );
}

// 14. VERSION CONTROL VIEW
function VersionControlView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">SDS Version Control & Revision History</h1>
        <p className="text-xs text-slate-400">Full audit trail of chemical safety changes.</p>
      </div>
      <div className="p-6 rounded-xl bg-[#0F172A] border border-slate-800 space-y-3 text-xs">
        <div className="flex justify-between p-3 bg-[#071A33] rounded-lg border border-slate-800">
          <div>
            <div className="font-bold text-white">v4.2.1 - Tetrahydrofuran</div>
            <div className="text-[10px] text-slate-400">Updated Section 9 Density & Viscosity</div>
          </div>
          <span className="text-slate-400 font-mono">2026-07-22</span>
        </div>
      </div>
    </div>
  );
}

// 15. PIPELINE CONSOLE VIEW
function PipelineConsoleView({ pipeline }: { pipeline: PipelineJob[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">SDS Worker Pipeline Console</h1>
        <p className="text-xs text-slate-400">Real-time asynchronous job processor status.</p>
      </div>
      <div className="p-6 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4">
        {pipeline.map((job) => (
          <div key={job.id} className="p-3 bg-[#071A33] rounded-lg border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between font-mono text-slate-300">
              <span>{job.id} • {job.chemicalName}</span>
              <span className="text-[#00B8D9]">{job.progress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#2563FF] h-full" style={{ width: `${job.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 16. SETTINGS VIEW
function SettingsView() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Enterprise Settings & API</h1>
        <p className="text-xs text-slate-400">Manage API keys, team access, and GHS compliance targets.</p>
      </div>
      <div className="p-6 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4 text-xs">
        <div className="space-y-1">
          <label className="font-semibold text-slate-200">Enthovion API Authorization Token</label>
          <input
            type="password"
            defaultValue="enthovion_live_sk_9021839021839012"
            className="w-full bg-[#071A33] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
          />
        </div>
        <button className="px-4 py-2 bg-[#2563FF] text-white rounded-lg font-semibold">
          Save Settings
        </button>
      </div>
    </div>
  );
}

// 17. PUBLIC LANDING PAGE VIEW
function PublicLandingPageView({ setActiveTab }: { setActiveTab: (t: NavTab) => void }) {
  return (
    <div className="space-y-12 py-6 max-w-5xl mx-auto">
      {/* HERO SECTION */}
      <div className="text-center space-y-4">
        <span className="px-3 py-1 rounded-full bg-[#00B8D9]/10 text-[#00B8D9] border border-[#00B8D9]/30 text-xs font-mono">
          Next-Gen Chemical Safety Platform
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Enterprise Chemical Intelligence & <span className="text-[#00B8D9]">AI SDS Authoring</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Automate 16-section GHS compliance, REACH Annex II regulatory updates, and hazard statement calculations in seconds.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className="px-6 py-2.5 rounded-lg bg-[#2563FF] hover:bg-blue-600 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 transition"
          >
            Launch Command Dashboard
          </button>
          <button
            onClick={() => setActiveTab("generate-sds")}
            className="px-6 py-2.5 rounded-lg bg-[#0F172A] border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold transition"
          >
            Try SDS Generator
          </button>
        </div>
      </div>

      {/* FEATURE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-[#0F172A] border border-slate-800 space-y-2">
          <FlaskConical className="w-6 h-6 text-[#00B8D9]" />
          <h3 className="font-bold text-sm text-white">GHS Additivity Engine</h3>
          <p className="text-xs text-slate-400">Instant mixture toxicological calculations and automatic signal word generation.</p>
        </div>
        <div className="p-6 rounded-xl bg-[#0F172A] border border-slate-800 space-y-2">
          <ShieldCheck className="w-6 h-6 text-[#16A34A]" />
          <h3 className="font-bold text-sm text-white">REACH Annex II Ready</h3>
          <p className="text-xs text-slate-400">Continuous regulatory monitoring against ECHA and OSHA HAZCOM standards.</p>
        </div>
        <div className="p-6 rounded-xl bg-[#0F172A] border border-slate-800 space-y-2">
          <Bot className="w-6 h-6 text-[#7C3AED]" />
          <h3 className="font-bold text-sm text-white">AI SDS Copilot</h3>
          <p className="text-xs text-slate-400">Conversational search and automated hazard section drafting.</p>
        </div>
      </div>
    </div>
  );
}

// HELPER COMPONENTS
function KPICard({
  title,
  value,
  subText,
  trend,
  icon: Icon,
  badgeColor
}: {
  title: string;
  value: string;
  subText: string;
  trend: "up" | "warning";
  icon: React.ElementType;
  badgeColor: "blue" | "green" | "amber" | "cyan";
}) {
  const badgeStyles = {
    blue: "bg-[#2563FF]/10 text-[#2563FF] border-[#2563FF]/30",
    green: "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30",
    amber: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
    cyan: "bg-[#00B8D9]/10 text-[#00B8D9] border-[#00B8D9]/30"
  };

  return (
    <div className="p-4 rounded-xl bg-[#0F172A]/80 border border-slate-800 hover:border-slate-700 transition space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className={`p-2 rounded-lg border ${badgeStyles[badgeColor]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-white">{value}</span>
      </div>
      <div className="text-[11px] text-slate-400 flex items-center gap-1">
        {trend === "up" ? (
          <TrendingUp className="w-3 h-3 text-[#16A34A]" />
        ) : (
          <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
        )}
        <span>{subText}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SDSDocument["status"] }) {
  const styles = {
    Compliant: "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30",
    "Expiring Soon": "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
    Draft: "bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/30",
    "Action Required": "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30"
  };

  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${styles[status]}`}>
      {status}
    </span>
  );
}