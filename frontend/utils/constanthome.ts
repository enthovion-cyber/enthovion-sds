export interface FAQItem {
  question: string;
  answer: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface WorkflowStep {
  step: string;
  title: string;
  description: string;
}

export interface PricingPlan {
  name: string;
  badge?: string;
  description: string;
  price: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export interface UseCase {
  title: string;
  description: string;
  icon: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    question: "What is Enthovion SDS?",
    answer: "Enthovion SDS is an AI-powered Safety Data Sheet platform for generating, validating, auditing, and managing SDS documents."
  },
  {
    question: "Is Enthovion SDS only a generator?",
    answer: "No. It includes generation, upload, validation, compliance review, auto-fix suggestions, SDS chatbot, labels, version control, and audit workflows."
  },
  {
    question: "Can AI-generated SDS be used directly?",
    answer: "No. AI-assisted SDS drafts must be reviewed and approved by qualified safety, regulatory, or technical professionals before operational use."
  },
  {
    question: "Which standards will Enthovion SDS support?",
    answer: "The roadmap includes GHS-style classification workflows, OSHA HazCom-ready review, CLP-style support, WHMIS-ready workflows, and label validation features."
  },
  {
    question: "Can I upload existing SDS files?",
    answer: "Yes. The platform is designed to extract and review information from uploaded SDS documents."
  },
  {
    question: "Does it support mixtures?",
    answer: "The roadmap includes mixture data input and AI-assisted hazard review for mixture SDS workflows."
  },
  {
    question: "Will there be version control?",
    answer: "Yes. Enthovion SDS is designed to support document versions, comparisons, approvals, and audit trails."
  },
  {
    question: "Who is it for?",
    answer: "Chemical engineers, HSE teams, process safety professionals, chemical manufacturers, industrial operators, consultants, and students."
  }
];

export const FEATURES_DATA: FeatureItem[] = [
  {
    id: "gen",
    title: "AI SDS Generation",
    description: "Create structured SDS drafts from chemical identity, CAS number, formula, mixture composition, and jurisdiction.",
    iconName: "Sparkles"
  },
  {
    id: "val",
    title: "16-Section Validation",
    description: "Check SDS completeness across all required sections and highlight missing, weak, or inconsistent information.",
    iconName: "FileCheck"
  },
  {
    id: "audit",
    title: "Compliance Audit",
    description: "Review SDS content against GHS-style requirements, OSHA HazCom, CLP-style classification needs, and internal compliance rules.",
    iconName: "ShieldAlert"
  },
  {
    id: "fix",
    title: "Auto-Fix Suggestions",
    description: "Receive AI-assisted recommendations to improve incomplete, inconsistent, or low-quality SDS sections before approval.",
    iconName: "Wand2"
  },
  {
    id: "chat",
    title: "SDS Chatbot",
    description: "Ask questions from approved SDS documents and receive section-aware answers with traceable references.",
    iconName: "MessageSquareCode"
  },
  {
    id: "label",
    title: "GHS Label Support",
    description: "Generate label-ready hazard pictograms, signal words, hazard statements, precautionary statements, and QR-ready outputs.",
    iconName: "Tag"
  },
  {
    id: "version",
    title: "Version Control",
    description: "Track revisions, compare SDS versions, maintain audit history, and roll back when needed.",
    iconName: "GitCommit"
  },
  {
    id: "lang",
    title: "Multi-Language Readiness",
    description: "Prepare SDS workflows for multilingual teams and international industrial operations.",
    iconName: "Globe"
  }
];

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: "01",
    title: "Input Chemical Data",
    description: "Start with CAS, formula, chemical name, supplier SDS, mixture data, or uploaded document."
  },
  {
    step: "02",
    title: "Generate / Extract",
    description: "AI drafts a structured SDS or extracts information from uploaded documents."
  },
  {
    step: "03",
    title: "Validate 16 Sections",
    description: "Completeness, hazards, physical properties, exposure controls, transport, and regulatory sections are reviewed."
  },
  {
    step: "04",
    title: "Detect Gaps",
    description: "Missing data, conflicts, weak safety language, and regulatory issues are flagged."
  },
  {
    step: "05",
    title: "Auto-Fix Suggestions",
    description: "AI recommends improvements that can be reviewed before acceptance."
  },
  {
    step: "06",
    title: "Approve & Publish",
    description: "Qualified users review, approve, export, and publish controlled SDS versions."
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Starter",
    description: "Students, individual engineers, and early testers.",
    price: "Coming Soon",
    features: [
      "Limited SDS generation",
      "Basic validation preview",
      "SDS chatbot preview",
      "Personal library",
      "Community launch updates"
    ],
    cta: "Join Waitlist"
  },
  {
    name: "Professional",
    badge: "Most Popular",
    highlighted: true,
    description: "Chemical engineers, HSE professionals, and small teams.",
    price: "Coming Soon",
    features: [
      "AI SDS generation",
      "Full 16-section validation",
      "Compliance audit",
      "Auto-fix suggestions",
      "SDS chatbot",
      "Version history",
      "Export reports"
    ],
    cta: "Request Early Access"
  },
  {
    name: "Enterprise",
    description: "Industrial companies, consulting firms, and safety-critical organizations.",
    price: "Custom",
    features: [
      "Multi-site SDS libraries",
      "Approval workflows",
      "Audit logs",
      "Role-based permissions",
      "Custom compliance rules",
      "Priority support",
      "Enterprise onboarding"
    ],
    cta: "Contact Founder"
  }
];

export const USE_CASES: UseCase[] = [
  {
    title: "Chemical Manufacturers",
    description: "Create, manage, and validate SDS across product portfolios.",
    icon: "Factory"
  },
  {
    title: "HSE Teams",
    description: "Track compliance gaps, expiry risk, and document readiness.",
    icon: "ShieldCheck"
  },
  {
    title: "Process Engineers",
    description: "Access SDS intelligence alongside engineering and chemical data.",
    icon: "Cpu"
  },
  {
    title: "Industrial Operators",
    description: "Find safety information faster during routine operations.",
    icon: "HardHat"
  },
  {
    title: "Consultants",
    description: "Review client SDS documents and generate structured audit reports.",
    icon: "Briefcase"
  },
  {
    title: "Students & Researchers",
    description: "Learn SDS structure, hazards, and chemical safety documentation.",
    icon: "GraduationCap"
  }
];