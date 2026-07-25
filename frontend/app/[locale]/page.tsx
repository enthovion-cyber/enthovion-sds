import { Metadata } from 'next';
import SdsHeader from '@/components/sds-landing/SdsHeader';
import SdsHero from '@/components/sds-landing/SdsHero';
import SdsProblemSolution from '@/components/sds-landing/SdsProblemSolution';
import SdsFeatures from '@/components/sds-landing/SdsFeatures';
import SdsWorkflow from '@/components/sds-landing/SdsWorkflow';
import SdsComplianceSection from '@/components/sds-landing/SdsComplianceSection';
import SdsProductPreviewSection from '@/components/sds-landing/SdsProductPreviewSection';
import SdsUseCases from '@/components/sds-landing/SdsUseCases';
import SdsPricing from '@/components/sds-landing/SdsPricing';
import SdsFAQ from '@/components/sds-landing/SdsFAQ';
import SdsWaitlist from '@/components/sds-landing/SdsWaitlist';
import SdsFooter from '@/components/sds-landing/SdsFooter';

export const metadata: Metadata = {
  title: 'Enthovion SDS — AI-Powered Safety Data Sheet Management',
  description:
    'Generate, validate, audit, and manage Safety Data Sheets with Enthovion SDS, an AI-powered platform for chemical engineering, compliance, and safer industrial operations.',
  openGraph: {
    title: 'Enthovion SDS — AI-Powered SDS Intelligence',
    description:
      'AI-assisted SDS generation, validation, compliance audit, auto-fix suggestions, chatbot, labels, version control, and document workflows.',
    siteName: 'Enthovion',
    type: 'website',
  },
};

export default function SdsLandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] dark:bg-[#020617] text-slate-100 selection:bg-[#2563FF] selection:text-white font-sans antialiased">
      <SdsHeader />
      <main>
        <SdsHero />
        <SdsProblemSolution />
        <SdsFeatures />
        <SdsWorkflow />
        <SdsComplianceSection />
        <SdsProductPreviewSection />
        <SdsUseCases />
        <SdsPricing />
        <SdsFAQ />
        <SdsWaitlist />
      </main>
      <SdsFooter />
    </div>
  );
}