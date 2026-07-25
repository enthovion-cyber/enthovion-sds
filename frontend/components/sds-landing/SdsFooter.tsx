import Link from 'next/link';
import SdsLogo from './SdsLogo';

export default function SdsFooter() {
  const platformLinks = [
    'Enthovion OS',
    'Enthovion Chem',
    'Enthovion Calc',
    'Enthovion PSM OS',
    'Enthovion Copilot',
  ];

  return (
    <footer className="border-t border-slate-800 bg-[#020617] text-slate-400 text-xs py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5 space-y-4">
          <SdsLogo />
          <p className="text-slate-400 max-w-sm leading-relaxed">
            AI-powered SDS intelligence for safer industrial operations.
          </p>
          <div className="pt-2 text-slate-500">
            Contact: <a href="mailto:hello@enthovion.com" className="text-slate-300 hover:underline">hello@enthovion.com</a>
          </div>
        </div>

        <div className="md:col-span-3 space-y-3">
          <h4 className="font-semibold text-slate-200">Product</h4>
          <ul className="space-y-2">
            <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
            <li><a href="#workflow" className="hover:text-white transition-colors">Workflow</a></li>
            <li><a href="#compliance" className="hover:text-white transition-colors">Compliance</a></li>
            <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
          </ul>
        </div>

        <div className="md:col-span-4 space-y-3">
          <h4 className="font-semibold text-slate-200">Platform Ecosystem</h4>
          <ul className="space-y-2">
            {platformLinks.map((plat) => (
              <li key={plat}>
                <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">
                  {plat}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 mt-12 border-t border-slate-900 flex items-center justify-between text-slate-500">
        <p>© 2026 Enthovion. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-400">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}