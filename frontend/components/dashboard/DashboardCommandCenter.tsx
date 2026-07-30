'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  DatabaseZap,
  FileCheck2,
  FileText,
  Filter,
  GitBranch,
  ListChecks,
  Loader2,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Upload,
  Wand2,
  Workflow,
  X,
  type LucideIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import Button from '@/components/ui/Button';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { useLocale } from '@/hooks/useLocale';
import { useAuthStore } from '@/store/authStore';
import type {
  ActivityFeedItem,
  ComplianceBreakdownItem,
  DashboardFilters,
  DashboardIssue,
  DashboardSummary,
  DashboardTask,
  LifecycleStatusCount,
  MetricValue,
  PipelineJobSummary,
  RecentSdsActivity,
  RegulatoryImpactItem,
  UpcomingReviewItem,
} from '@/lib/dashboard/dashboard-types';

const statusTone: Record<string, string> = {
  approved: 'text-[#16A34A] bg-[rgba(34,197,94,0.12)]',
  draft: 'text-[#64748B] bg-[rgba(100,116,139,0.12)]',
  submitted: 'text-[#2563EB] bg-[rgba(37,99,235,0.12)]',
  pending_review: 'text-[#2563EB] bg-[rgba(37,99,235,0.12)]',
  technical_review: 'text-[#2563EB] bg-[rgba(37,99,235,0.12)]',
  regulatory_review: 'text-[#2563EB] bg-[rgba(37,99,235,0.12)]',
  changes_requested: 'text-[#D97706] bg-[rgba(245,158,11,0.12)]',
  expired: 'text-[#DC2626] bg-[rgba(239,68,68,0.12)]',
  published: 'text-[#0891B2] bg-[rgba(34,211,238,0.12)]',
  superseded: 'text-[#7C3AED] bg-[rgba(124,58,237,0.12)]',
  failed: 'text-[#DC2626] bg-[rgba(239,68,68,0.12)]',
  blocked: 'text-[#D97706] bg-[rgba(245,158,11,0.12)]',
  open: 'text-[#2563EB] bg-[rgba(37,99,235,0.12)]',
  overdue: 'text-[#DC2626] bg-[rgba(239,68,68,0.12)]',
};

const severityTone: Record<string, string> = {
  critical: 'text-[#DC2626] bg-[rgba(239,68,68,0.12)]',
  major: 'text-[#D97706] bg-[rgba(245,158,11,0.12)]',
  minor: 'text-[#2563EB] bg-[rgba(37,99,235,0.12)]',
  info: 'text-[#64748B] bg-[rgba(100,116,139,0.12)]',
  high: 'text-[#D97706] bg-[rgba(245,158,11,0.12)]',
  medium: 'text-[#2563EB] bg-[rgba(37,99,235,0.12)]',
  low: 'text-[#64748B] bg-[rgba(100,116,139,0.12)]',
};

const lifecycleColors: Record<string, string> = {
  draft: '#64748B',
  submitted: '#3B82F6',
  technical_review: '#1E5BFF',
  regulatory_review: '#22D3EE',
  changes_requested: '#F59E0B',
  approved: '#22C55E',
  published: '#0891B2',
  expired: '#EF4444',
  superseded: '#7C3AED',
  archived: '#94A3B8',
};

const dateRanges = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: '12 months', value: '12m' },
] as const;

function localizeHref(locale: string, href?: string) {
  if (!href) return `/${locale}/dashboard`;
  return href.startsWith('/') ? `/${locale}${href}` : `/${locale}/${href}`;
}

function formatDate(value?: string) {
  if (!value) return 'Not scheduled';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function formatDateTime(value?: string) {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function labelize(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
}

function Badge({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', tone || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300')}>
      {children}
    </span>
  );
}

function Panel({ title, icon: Icon, action, children, className }: {
  title: string;
  icon: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx('rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700/70 dark:bg-[#070E24]', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(30,91,255,0.10)] text-[#1E5BFF]">
            <Icon size={18} aria-hidden="true" />
          </span>
          <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm dark:border-slate-700 dark:bg-[#0B132B]">
      <p className="font-medium text-slate-900 dark:text-slate-100">{title}</p>
      <p className="mt-1 text-slate-500 dark:text-slate-400">{description}</p>
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800', className)} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-28" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => <SkeletonBlock key={index} className="h-36" />)}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <SkeletonBlock className="h-96 xl:col-span-2" />
        <SkeletonBlock className="h-96" />
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon, href, inverseTrend }: {
  label: string;
  value: MetricValue;
  detail: string;
  icon: LucideIcon;
  href: string;
  inverseTrend?: boolean;
}) {
  const improved = value.trend === 'flat' || (inverseTrend ? value.trend === 'down' : value.trend === 'up');
  const tone = value.status === 'critical' ? 'text-[#EF4444]' : value.status === 'warning' ? 'text-[#F59E0B]' : value.status === 'good' ? 'text-[#22C55E]' : 'text-[#1E5BFF]';
  const trendLabel = value.percentChange == null ? 'No previous comparison' : `${value.percentChange > 0 ? '+' : ''}${value.percentChange}% vs previous period`;

  return (
    <Link
      href={href as never}
      title={`${label}. ${detail}. ${trendLabel}`}
      className="group rounded-2xl border border-slate-200 bg-white p-5 outline-none transition hover:-translate-y-0.5 hover:border-[#1E5BFF]/40 focus-visible:ring-2 focus-visible:ring-[#1E5BFF] dark:border-slate-700/70 dark:bg-[#070E24]"
    >
      <div className="flex items-start justify-between gap-4">
        <span className={clsx('flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(30,91,255,0.10)]', tone)}>
          <Icon size={18} aria-hidden="true" />
        </span>
        <Badge tone={improved ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}>
          {trendLabel}
        </Badge>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-950 dark:text-slate-50">{value.value}{label.toLowerCase().includes('score') || label.toLowerCase().includes('health') ? '%' : ''}</p>
      <div className="mt-3 flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span>{detail}</span>
        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
    </Link>
  );
}

function AttentionBanner({ summary, locale }: { summary: DashboardSummary; locale: string }) {
  const criticalCount = summary.kpis.criticalIssues.value + summary.kpis.expiringSoon.value + summary.kpis.pendingApprovals.value + summary.pipelineHealth.failed;
  const [dismissed, setDismissed] = useState(false);
  if (criticalCount === 0 || dismissed) return null;

  const isCritical = summary.kpis.criticalIssues.value > 0 || summary.pipelineHealth.failed > 0;
  return (
    <div className={clsx('flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between', isCritical ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-100' : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100')} role="status" aria-live="polite">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">{criticalCount} issues require attention</p>
          <p className="text-sm opacity-85">
            {summary.kpis.expiringSoon.value} expiring SDS documents, {summary.kpis.pendingApprovals.value} pending approvals, and {summary.kpis.criticalIssues.value} critical validation findings.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link href={`/${locale}/validation?severity=critical&status=open` as never} className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-red-700 outline-none transition hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 dark:bg-red-950/40 dark:text-red-100">
          Review issues
        </Link>
        {!isCritical ? (
          <button type="button" onClick={() => setDismissed(true)} className="rounded-xl p-2 outline-none hover:bg-white/60 focus-visible:ring-2 focus-visible:ring-amber-500" aria-label="Dismiss attention banner">
            <X size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ComplianceChart({ summary, locale }: { summary: DashboardSummary; locale: string }) {
  const width = 520;
  const height = 190;
  const points = summary.complianceTrend.map((point, index) => {
    const x = summary.complianceTrend.length === 1 ? width / 2 : (index / (summary.complianceTrend.length - 1)) * width;
    const y = height - (point.score / 100) * height;
    return `${x},${y}`;
  }).join(' ');
  const thresholdY = height - (85 / 100) * height;

  return (
    <Panel title="Compliance Health" icon={ShieldCheck} className="xl:col-span-2" action={<Link href={`/${locale}/compliance` as never} className="text-sm font-medium text-[#1E5BFF]">Open findings</Link>}>
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-semibold text-slate-950 dark:text-slate-50">{summary.kpis.complianceScore.value}%</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Average score across active SDS documents</p>
            </div>
            <Badge tone={summary.kpis.complianceScore.status === 'good' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}>Threshold 85%</Badge>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#0B132B]">
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Compliance score trend. Current score ${summary.kpis.complianceScore.value} percent.`} className="h-56 w-full overflow-visible">
              <line x1="0" x2={width} y1={thresholdY} y2={thresholdY} stroke="#F59E0B" strokeDasharray="5 5" strokeWidth="2" />
              <polyline points={points} fill="none" stroke="#1E5BFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {summary.complianceTrend.map((point, index) => {
                const x = summary.complianceTrend.length === 1 ? width / 2 : (index / (summary.complianceTrend.length - 1)) * width;
                const y = height - (point.score / 100) * height;
                return <circle key={point.date} cx={x} cy={y} r="5" fill="#22D3EE"><title>{`${formatDate(point.date)}: ${point.score}%`}</title></circle>;
              })}
            </svg>
          </div>
        </div>
        <div className="space-y-3">
          {summary.complianceBreakdown.map((item) => (
            <Link key={item.key} href={localizeHref(locale, item.href) as never} className="block rounded-xl border border-slate-200 p-3 outline-none hover:border-[#1E5BFF]/40 focus-visible:ring-2 focus-visible:ring-[#1E5BFF] dark:border-slate-700">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
                <span className="font-semibold text-slate-950 dark:text-slate-50">{item.score}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-2 rounded-full bg-[#1E5BFF]" style={{ width: `${Math.max(0, Math.min(100, item.score))}%` }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function LifecyclePanel({ items, locale }: { items: LifecycleStatusCount[]; locale: string }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  return (
    <Panel title="SDS Lifecycle" icon={GitBranch}>
      {total === 0 ? (
        <EmptyState title="No SDS documents yet" description="Generate a new SDS or upload an existing supplier document to begin." actions={<><Link href={`/${locale}/sds/generate` as never}><Button size="sm" leftIcon={<Wand2 size={14} />}>Generate SDS</Button></Link><Link href={`/${locale}/sds/upload` as never}><Button size="sm" variant="outline" leftIcon={<Upload size={14} />}>Upload SDS</Button></Link></>} />
      ) : (
        <div className="space-y-4">
          <div className="flex h-5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-label={`${total} total lifecycle documents`}>
            {items.filter((item) => item.count > 0).map((item) => (
              <Link key={item.status} title={`${item.label}: ${item.count}`} href={`/${locale}/sds?status=${item.status}` as never} className="outline-none focus-visible:ring-2 focus-visible:ring-white" style={{ width: `${(item.count / total) * 100}%`, backgroundColor: lifecycleColors[item.status] }} />
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item.status} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lifecycleColors[item.status] }} />{item.label}</span>
                <span className="font-semibold text-slate-950 dark:text-slate-50">{item.count}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-200">
            Monitor drafts older than 30 days, overdue approvals, expired active SDS, and newer unapproved versions.
          </div>
        </div>
      )}
    </Panel>
  );
}

function TasksPanel({ tasks, locale }: { tasks: DashboardTask[]; locale: string }) {
  const [type, setType] = useState('all');
  const filtered = type === 'all' ? tasks : tasks.filter((task) => task.type === type);
  const taskTypes = Array.from(new Set(tasks.map((task) => task.type)));
  return (
    <Panel title="My Tasks" icon={ListChecks} action={<Link href={`/${locale}/compliance` as never} className="text-sm font-medium text-[#1E5BFF]">View all tasks</Link>}>
      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setType('all')} className={clsx('rounded-full px-3 py-1.5 text-xs font-medium', type === 'all' ? 'bg-[#1E5BFF] text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300')}>All</button>
        {taskTypes.map((taskType) => <button key={taskType} onClick={() => setType(taskType)} className={clsx('rounded-full px-3 py-1.5 text-xs font-medium', type === taskType ? 'bg-[#1E5BFF] text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300')}>{labelize(taskType)}</button>)}
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="You have no outstanding tasks." description="Assigned reviews, approvals, and corrective actions will appear here when they require attention." />
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <div key={task.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-950 dark:text-slate-50">{task.title}</p>
                    <Badge tone={severityTone[task.priority]}>{labelize(task.priority)}</Badge>
                    <Badge tone={statusTone[task.status]}>{labelize(task.status)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task.relatedEntityLabel} · {task.assignedRole} · Due {formatDate(task.dueAt)}</p>
                </div>
                <Link href={localizeHref(locale, task.href) as never} className="rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#1E5BFF] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">{task.actionLabel}</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function IssuesPanel({ issues, locale }: { issues: DashboardIssue[]; locale: string }) {
  return (
    <Panel title="Critical Issues" icon={ShieldAlert} action={<Link href={`/${locale}/validation?severity=critical&status=open` as never} className="text-sm font-medium text-[#1E5BFF]">View all</Link>}>
      {issues.length === 0 ? (
        <EmptyState title="No critical issues detected" description="Your current SDS documents have no unresolved critical findings." />
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div key={issue.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={severityTone[issue.severity]}>{labelize(issue.severity)}</Badge>
                    <Badge tone={statusTone[issue.status]}>{labelize(issue.status)}</Badge>
                    {issue.ruleId ? <span className="font-mono text-xs text-slate-400">{issue.ruleId}</span> : null}
                  </div>
                  <p className="mt-2 font-medium text-slate-950 dark:text-slate-50">{issue.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{issue.sdsName} · Section {issue.sectionNumber || 'n/a'} · {issue.jurisdiction || 'All jurisdictions'} · {issue.source}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link href={localizeHref(locale, issue.href) as never} className="rounded-lg bg-[#1E5BFF] px-3 py-2 text-sm font-medium text-white outline-none hover:bg-[#1748CC] focus-visible:ring-2 focus-visible:ring-[#1E5BFF]">Resolve</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function RecentActivityTable({ rows, locale }: { rows: RecentSdsActivity[]; locale: string }) {
  const [search, setSearch] = useState('');
  const filtered = rows.filter((row) => row.product.toLowerCase().includes(search.toLowerCase()) || row.identifier.toLowerCase().includes(search.toLowerCase()));
  return (
    <Panel title="Recent SDS Activity" icon={FileText} className="xl:col-span-3" action={<Link href={`/${locale}/sds` as never} className="text-sm font-medium text-[#1E5BFF]">View all</Link>}>
      <label className="mb-4 flex max-w-md items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
        <Search size={16} className="text-slate-400" aria-hidden="true" />
        <span className="sr-only">Search recent SDS activity</span>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product or identifier" className="w-full bg-transparent outline-none placeholder:text-slate-400" />
      </label>
      {filtered.length === 0 ? (
        <EmptyState title="No SDS documents yet" description="Generate a new SDS or upload an existing supplier document to begin." />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium text-slate-500 dark:bg-[#0B132B] dark:text-slate-400">
                <tr>
                  {['Product', 'SDS identifier', 'Version', 'Jurisdiction', 'Language', 'Status', 'Score', 'Owner', 'Updated', 'Actions'].map((head) => <th key={head} className="px-3 py-3">{head}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="px-3 py-3 font-medium text-slate-900 dark:text-slate-100">{row.product}</td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-500">{row.identifier}</td>
                    <td className="px-3 py-3">v{row.version}</td>
                    <td className="px-3 py-3">{row.jurisdiction}</td>
                    <td className="px-3 py-3">{row.language}</td>
                    <td className="px-3 py-3"><Badge tone={statusTone[row.status]}>{labelize(row.status)}</Badge></td>
                    <td className="px-3 py-3">{row.complianceScore == null ? 'n/a' : `${row.complianceScore}%`}</td>
                    <td className="px-3 py-3">{row.owner}</td>
                    <td className="px-3 py-3">{formatDate(row.updatedAt)}</td>
                    <td className="px-3 py-3"><Link href={localizeHref(locale, row.href) as never} className="font-medium text-[#1E5BFF]">Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {filtered.map((row) => (
              <Link key={row.id} href={localizeHref(locale, row.href) as never} className="block rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950 dark:text-slate-50">{row.product}</p>
                    <p className="font-mono text-xs text-slate-500">{row.identifier} · v{row.version}</p>
                  </div>
                  <Badge tone={statusTone[row.status]}>{labelize(row.status)}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">{row.jurisdiction} · {row.language} · {formatDate(row.updatedAt)}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </Panel>
  );
}

function RegulatoryPanel({ items, locale }: { items: RegulatoryImpactItem[]; locale: string }) {
  return (
    <Panel title="Regulatory Impact" icon={Scale} action={<Link href={`/${locale}/regulatory` as never} className="text-sm font-medium text-[#1E5BFF]">Open regulatory</Link>}>
      {items.length === 0 ? <EmptyState title="No active regulatory impact" description="No recent regulatory changes affect the selected products or jurisdictions." /> : (
        <div className="space-y-3">{items.map((item) => <Link key={item.id} href={localizeHref(locale, item.href) as never} className="block rounded-xl border border-slate-200 p-3 dark:border-slate-700"><p className="font-medium">{item.title}</p><p className="text-sm text-slate-500">{item.framework} · {item.jurisdiction} · {item.affectedSds} SDS affected</p></Link>)}</div>
      )}
    </Panel>
  );
}

function PipelinePanel({ summary, jobs, locale, technical }: { summary: DashboardSummary['pipelineHealth']; jobs: PipelineJobSummary[]; locale: string; technical: boolean }) {
  const stages = ['Ingest', 'Extract', 'Normalize', 'Enrich', 'Classify', 'Generate', 'Validate', 'Compliance Check', 'Auto-fix', 'Review Required', 'Complete'];
  return (
    <Panel title="Pipeline Health" icon={Workflow} action={<Link href={`/${locale}/pipeline` as never} className="text-sm font-medium text-[#1E5BFF]">Open console</Link>}>
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {[['Processed today', summary.jobsToday], ['Success rate', `${summary.successRate}%`], ['Running', summary.running], ['Failed', summary.failed]].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl bg-slate-50 p-3 dark:bg-[#0B132B]"><p className="text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 text-xl font-semibold text-slate-950 dark:text-slate-50">{value}</p></div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Pipeline stages">
        {stages.map((stage) => <span key={stage} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">{stage}</span>)}
      </div>
      {jobs.length === 0 ? <div className="mt-4"><EmptyState title="Pipeline operating normally" description="No failed or blocked jobs were found for the selected period." /></div> : null}
      {technical && jobs.length > 0 ? <div className="mt-4 space-y-3">{jobs.map((job) => <Link key={job.id} href={localizeHref(locale, job.href) as never} className="block rounded-xl border border-slate-200 p-3 dark:border-slate-700"><p className="font-mono text-xs text-slate-500">{job.id}</p><p className="font-medium">{job.relatedDocument}</p></Link>)}</div> : null}
    </Panel>
  );
}

function ApprovalPanel({ summary, locale, canManage }: { summary: DashboardSummary['approvalWorkload']; locale: string; canManage: boolean }) {
  return (
    <Panel title="Approval Workload" icon={ClipboardCheck} action={<Link href={`/${locale}/sds?status=pending_review` as never} className="text-sm font-medium text-[#1E5BFF]">Open queue</Link>}>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[['Technical review', summary.technicalReview], ['Regulatory review', summary.regulatoryReview], ['Final approval', summary.finalApproval], ['Overdue', summary.overdue]].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl bg-slate-50 p-3 dark:bg-[#0B132B]"><p className="text-slate-500">{label}</p><p className="text-xl font-semibold text-slate-950 dark:text-slate-50">{value}</p></div>
        ))}
      </div>
      {canManage && summary.reviewers.length > 0 ? <div className="mt-4 space-y-2">{summary.reviewers.map((reviewer) => <div key={reviewer.id} className="flex justify-between text-sm"><span>{reviewer.name}</span><span>{reviewer.assignedCount} assigned</span></div>)}</div> : null}
    </Panel>
  );
}

function UpcomingReviewsPanel({ items, locale }: { items: UpcomingReviewItem[]; locale: string }) {
  return (
    <Panel title="Upcoming Reviews" icon={CalendarClock}>
      {items.length === 0 ? <EmptyState title="No reviews due soon" description="No SDS review or expiry dates fall within the next 30 days." /> : (
        <div className="space-y-3">{items.map((item) => <Link key={item.id} href={localizeHref(locale, item.href) as never} className="block rounded-xl border border-slate-200 p-3 dark:border-slate-700"><div className="flex justify-between gap-3"><p className="font-medium text-slate-950 dark:text-slate-50">{item.product}</p><Badge tone={severityTone[item.riskLevel]}>{labelize(item.riskLevel)}</Badge></div><p className="mt-1 text-sm text-slate-500">v{item.version} · {item.jurisdiction} · {formatDate(item.reviewDate)}</p></Link>)}</div>
      )}
    </Panel>
  );
}

function DataQualityPanel({ data, locale }: { data: DashboardSummary['dataQuality']; locale: string }) {
  const entries = [
    ['Missing sources', data.missingSources],
    ['Low-confidence fields', data.lowConfidenceFields],
    ['Unverified AI values', data.unverifiedAiValues],
    ['Duplicate candidates', data.duplicateCandidates],
    ['Missing owner', data.missingOwner],
    ['Missing review date', data.missingReviewDate],
    ['Products without published SDS', data.productsWithoutPublishedSds],
    ['Labels out of sync', data.labelsOutOfSync],
  ];
  return (
    <Panel title="Data Quality" icon={DatabaseZap}>
      <div className="space-y-2">
        {entries.map(([label, value]) => <Link key={String(label)} href={`/${locale}/validation` as never} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"><span className="text-slate-600 dark:text-slate-300">{label}</span><span className="font-semibold text-slate-950 dark:text-slate-50">{value}</span></Link>)}
      </div>
    </Panel>
  );
}

function ActivityFeed({ items, locale }: { items: ActivityFeedItem[]; locale: string }) {
  return (
    <Panel title="Activity Feed" icon={Bell} className="xl:col-span-2">
      {items.length === 0 ? <EmptyState title="No recent activity" description="SDS, validation, approval, and regulatory events will appear here." /> : (
        <div className="space-y-3">{items.map((item) => <Link key={item.id} href={localizeHref(locale, item.href) as never} className="block rounded-xl border border-slate-200 p-3 dark:border-slate-700"><p className="text-sm text-slate-950 dark:text-slate-50"><span className="font-medium">{item.actor}</span> {item.action} <span className="font-medium">{item.objectLabel}</span></p><p className="mt-1 text-xs text-slate-500">{item.scope} · {formatDateTime(item.timestamp)} {item.status ? `· ${labelize(item.status)}` : ''}</p></Link>)}</div>
      )}
    </Panel>
  );
}

function QuickActionsPanel({ locale, viewer }: { locale: string; viewer: boolean }) {
  const actions = viewer
    ? [{ icon: FileText, label: 'Search SDS', description: 'Find published documents', href: `/${locale}/sds` }]
    : [
      { icon: Wand2, label: 'Generate SDS', description: 'Author from product data', href: `/${locale}/sds/generate` },
      { icon: Upload, label: 'Upload SDS', description: 'Ingest supplier PDF', href: `/${locale}/sds/upload` },
      { icon: CheckCircle2, label: 'Run validation', description: 'Check hazards and sections', href: `/${locale}/validation` },
      { icon: Scale, label: 'Compliance review', description: 'Audit jurisdiction gaps', href: `/${locale}/compliance` },
      { icon: Tag, label: 'Generate label', description: 'Create aligned GHS label', href: `/${locale}/labels` },
      { icon: Workflow, label: 'Pipeline queue', description: 'Inspect processing jobs', href: `/${locale}/pipeline` },
    ];
  return (
    <Panel title="Quick Actions" icon={Sparkles}>
      <div className="space-y-2">{actions.map(({ icon: Icon, label, description, href }) => <Link key={label} href={href as never} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 outline-none hover:border-[#1E5BFF]/40 focus-visible:ring-2 focus-visible:ring-[#1E5BFF] dark:border-slate-700"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(34,211,238,0.10)] text-cyan-500"><Icon size={16} /></span><span><span className="block text-sm font-medium text-slate-950 dark:text-slate-50">{label}</span><span className="text-xs text-slate-500">{description}</span></span></Link>)}</div>
    </Panel>
  );
}

function HeaderFilters({ filters, setFilter, resetFilters, activeCount }: {
  filters: DashboardFilters;
  setFilter: (key: keyof DashboardFilters, value: string) => void;
  resetFilters: () => void;
  activeCount: number;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-xs font-medium text-slate-500">Date range
        <select value={filters.range || '30d'} onChange={(event) => setFilter('range', event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#1E5BFF] dark:border-slate-700 dark:bg-[#0B132B] dark:text-slate-100">
          {dateRanges.map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}
        </select>
      </label>
      <label className="text-xs font-medium text-slate-500">Jurisdiction
        <select value={filters.jurisdiction || ''} onChange={(event) => setFilter('jurisdiction', event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#1E5BFF] dark:border-slate-700 dark:bg-[#0B132B] dark:text-slate-100">
          <option value="">All jurisdictions</option>
          {['US_OSHA', 'EU_CLP', 'UK_HSE', 'AU_WHS', 'CA_WHMIS', 'SA_SASO', 'CN_GB'].map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label className="text-xs font-medium text-slate-500">SDS status
        <select value={filters.status || ''} onChange={(event) => setFilter('status', event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#1E5BFF] dark:border-slate-700 dark:bg-[#0B132B] dark:text-slate-100">
          <option value="">All statuses</option>
          {['draft', 'pending_review', 'approved', 'published', 'expired', 'changes_requested'].map((item) => <option key={item} value={item}>{labelize(item)}</option>)}
        </select>
      </label>
      <div className="flex items-end gap-2">
        <Badge tone="bg-[rgba(30,91,255,0.10)] text-[#1E5BFF]"><Filter size={12} className="mr-1" />{activeCount} active</Badge>
        <button type="button" onClick={resetFilters} className="h-10 rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Reset</button>
      </div>
    </div>
  );
}

export default function DashboardCommandCenter() {
  const { locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const filters = useMemo<DashboardFilters>(() => ({
    range: (searchParams.get('range') as DashboardFilters['range']) || '30d',
    jurisdiction: searchParams.get('jurisdiction') || undefined,
    status: searchParams.get('status') || undefined,
    language: searchParams.get('language') || undefined,
    site_id: searchParams.get('site_id') || undefined,
  }), [searchParams]);
  const { summary, isLoading, isRefreshing, error, refresh } = useDashboardSummary(filters);

  const setFilter = (key: keyof DashboardFilters, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`/${locale}/dashboard?${params.toString()}` as never, { scroll: false });
  };

  const resetFilters = () => router.replace(`/${locale}/dashboard` as never, { scroll: false });
  const activeCount = Object.entries(filters).filter(([key, value]) => key !== 'range' && Boolean(value)).length;
  const viewer = user?.role === 'worker' || summary?.scope.role === 'worker';
  const canManage = user?.role === 'admin' || summary?.scope.role === 'admin';

  if (isLoading && !summary) return <DashboardSkeleton />;

  if (error && !summary) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-100">
        <p className="font-semibold">Dashboard unavailable</p>
        <p className="mt-1 text-sm">{error}</p>
        <Button className="mt-4" onClick={() => void refresh()} leftIcon={<RefreshCw size={14} />}>Retry</Button>
      </div>
    );
  }

  if (!summary) return null;

  const orgName = user?.company || summary.scope.organizationName;
  const kpis = [
    { label: 'Total SDS', value: summary.kpis.totalSds, detail: 'Active documents excluding archived records', icon: FileText, href: localizeHref(locale, summary.kpis.totalSds.href) },
    { label: 'Approved SDS', value: summary.kpis.approvedSds, detail: 'Approved documents as a share of total', icon: FileCheck2, href: localizeHref(locale, summary.kpis.approvedSds.href) },
    { label: 'Compliance score', value: summary.kpis.complianceScore, detail: 'Latest completed assessment per active SDS', icon: ShieldCheck, href: localizeHref(locale, summary.kpis.complianceScore.href) },
    { label: 'Critical issues', value: summary.kpis.criticalIssues, detail: 'Unresolved critical findings', icon: ShieldAlert, href: localizeHref(locale, summary.kpis.criticalIssues.href), inverseTrend: true },
    { label: 'Pending approvals', value: summary.kpis.pendingApprovals, detail: 'Documents awaiting review or approval', icon: ClipboardCheck, href: localizeHref(locale, summary.kpis.pendingApprovals.href), inverseTrend: true },
    { label: 'Expiring soon', value: summary.kpis.expiringSoon, detail: 'Review or expiry date within 30 days', icon: CalendarClock, href: localizeHref(locale, summary.kpis.expiringSoon.href), inverseTrend: true },
    { label: 'Regulatory impact', value: summary.kpis.regulatoryImpact, detail: 'Affected SDS from recent regulatory updates', icon: Scale, href: localizeHref(locale, summary.kpis.regulatoryImpact.href), inverseTrend: true },
    { label: 'Pipeline health', value: summary.kpis.pipelineHealth, detail: 'Successful jobs excluding cancelled jobs', icon: Workflow, href: localizeHref(locale, summary.kpis.pipelineHealth.href) },
  ];
  const visibleKpis = viewer ? kpis.slice(0, 3) : kpis;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 text-slate-900 dark:text-slate-100">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700/70 dark:bg-[#070E24]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950 dark:text-slate-50">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Monitor SDS compliance, approvals, regulatory impact, and document health.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Badge>{orgName}</Badge>
              <Badge>{summary.scope.siteName || 'All accessible sites'}</Badge>
              <Badge>Last refreshed {formatDateTime(summary.generatedAt)}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void refresh()} isLoading={isRefreshing} leftIcon={<RefreshCw size={14} />} title="Refresh dashboard data without reloading the page">Refresh</Button>
            {!viewer ? <Link href={`/${locale}/sds/generate` as never}><Button leftIcon={<Wand2 size={14} />}>Generate SDS</Button></Link> : null}
            {!viewer ? <Link href={`/${locale}/sds/upload` as never}><Button variant="secondary" leftIcon={<Upload size={14} />}>Upload SDS</Button></Link> : null}
          </div>
        </div>
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#0B132B]">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"><SlidersHorizontal size={16} /> Global filters</div>
          <HeaderFilters filters={filters} setFilter={setFilter} resetFilters={resetFilters} activeCount={activeCount} />
        </div>
      </header>

      <AttentionBanner summary={summary} locale={locale} />

      <section aria-label="Dashboard metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visibleKpis.map((item) => <MetricCard key={item.label} {...item} />)}
      </section>

      {viewer ? (
        <div className="grid gap-4 xl:grid-cols-3">
          <RecentActivityTable rows={summary.recentSdsActivity} locale={locale} />
          <UpcomingReviewsPanel items={summary.upcomingReviews} locale={locale} />
          <QuickActionsPanel locale={locale} viewer />
        </div>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-3">
            <ComplianceChart summary={summary} locale={locale} />
            <LifecyclePanel items={summary.lifecycleDistribution} locale={locale} />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <TasksPanel tasks={summary.myTasks} locale={locale} />
            <IssuesPanel issues={summary.criticalIssues} locale={locale} />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <RegulatoryPanel items={summary.regulatoryImpact} locale={locale} />
            <PipelinePanel summary={summary.pipelineHealth} jobs={summary.recentPipelineJobs} locale={locale} technical={canManage} />
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <RecentActivityTable rows={summary.recentSdsActivity} locale={locale} />
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <ApprovalPanel summary={summary.approvalWorkload} locale={locale} canManage={canManage} />
            <UpcomingReviewsPanel items={summary.upcomingReviews} locale={locale} />
            <DataQualityPanel data={summary.dataQuality} locale={locale} />
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <ActivityFeed items={summary.activityFeed} locale={locale} />
            <QuickActionsPanel locale={locale} viewer={false} />
          </div>
        </>
      )}
    </div>
  );
}
