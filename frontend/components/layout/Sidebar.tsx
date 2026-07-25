"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Wand2,
  BookOpen,
  FileOutput,
  ShieldCheck,
  Settings,
  LogOut,
  MessageCircle,
  Scale,
  CheckCircle,
  Tag,
  GitBranch,
  Workflow,
} from "lucide-react";
import { clsx } from "clsx";
import { useLocale } from "@/hooks/useLocale";
import { useAuth } from "@/hooks/useAuth";

const getNavItems = (locale: string) => [
  { href: `/${locale}/dashboard`, label: "Dashboard", icon: LayoutDashboard },

  { href: `/${locale}/sds`, label: "SDS Library", icon: FileText },
  { href: `/${locale}/sds/generate`, label: "Generate SDS", icon: Wand2 },
  { href: `/${locale}/sds/upload`, label: "Upload SDS", icon: Upload },

  { href: `/${locale}/chat`, label: "SDS Chatbot", icon: MessageCircle },
  { href: `/${locale}/copilot`, label: "Copilot", icon: MessageCircle },
  
  { href: `/${locale}/sop`, label: "SOP Library", icon: BookOpen },
  { href: `/${locale}/sop/generate`, label: "Generate SOP", icon: FileOutput },

  { href: `/${locale}/compliance`, label: "Compliance", icon: ShieldCheck },
  { href: `/${locale}/regulatory`, label: "Regulatory", icon: Scale },
  { href: `/${locale}/mixtures`, label: "Mixture", icon: Scale },

  { href: `/${locale}/validation`, label: "Validation", icon: CheckCircle },
  { href: `/${locale}/labels`, label: "Label", icon: Tag },

  { href: `/${locale}/version`, label: "Version Control", icon: GitBranch },
  { href: `/${locale}/pipeline`, label: "Pipeline Console", icon: Workflow },

  { href: `/${locale}/settings/profile`, label: "Settings", icon: Settings },
];
export default function Sidebar() {
  const pathname = usePathname();
  const { locale, isRTL } = useLocale();
  const { logout } = useAuth();

  return (
    <aside
      className={clsx(
        "fixed top-0 h-full w-64 bg-white border-gray-200 flex flex-col z-30",
        isRTL ? "right-0 border-l" : "left-0 border-r",
      )}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            SafeSheet AI
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {getNavItems(locale).map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== `/${locale}/dashboard` && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => logout(locale)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
