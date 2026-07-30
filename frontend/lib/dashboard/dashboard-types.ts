export type DashboardRole = 'admin' | 'ehs_manager' | 'worker';

export type MetricStatus = 'good' | 'warning' | 'critical' | 'neutral';
export type MetricTrend = 'up' | 'down' | 'flat';

export interface MetricValue {
  value: number;
  previousValue?: number;
  percentChange?: number;
  trend?: MetricTrend;
  status?: MetricStatus;
  href?: string;
}

export interface DashboardKpis {
  totalSds: MetricValue;
  approvedSds: MetricValue;
  complianceScore: MetricValue;
  criticalIssues: MetricValue;
  pendingApprovals: MetricValue;
  expiringSoon: MetricValue;
  regulatoryImpact: MetricValue;
  pipelineHealth: MetricValue;
}

export interface DashboardScope {
  organizationName: string;
  siteName?: string;
  role: DashboardRole;
}

export interface ComplianceTrendPoint {
  date: string;
  score: number;
  threshold: number;
}

export interface ComplianceBreakdownItem {
  key: string;
  label: string;
  score: number;
  change: number;
  status: MetricStatus;
  href: string;
}

export type SdsLifecycleStatus =
  | 'draft'
  | 'submitted'
  | 'technical_review'
  | 'regulatory_review'
  | 'changes_requested'
  | 'approved'
  | 'published'
  | 'expired'
  | 'superseded'
  | 'archived';

export interface LifecycleStatusCount {
  status: SdsLifecycleStatus;
  label: string;
  count: number;
}

export interface DashboardTask {
  id: string;
  type:
    | 'technical_review'
    | 'regulatory_review'
    | 'approval'
    | 'validation_issue'
    | 'compliance_action'
    | 'regulatory_acknowledgement'
    | 'sds_expiry_review'
    | 'supplier_follow_up'
    | 'pipeline_intervention'
    | 'sop_acknowledgement';
  title: string;
  relatedEntityLabel: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'blocked' | 'completed' | 'overdue';
  dueAt?: string;
  assignedRole: string;
  href: string;
  actionLabel: string;
}

export interface DashboardIssue {
  id: string;
  title: string;
  severity: 'info' | 'minor' | 'major' | 'critical';
  source: 'validation' | 'compliance' | 'regulatory' | 'data_quality';
  ruleId?: string;
  sdsId: string;
  sdsName: string;
  sectionNumber?: number;
  jurisdiction?: string;
  ownerName?: string;
  detectedAt: string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'overridden';
  href: string;
}

export interface RecentSdsActivity {
  id: string;
  product: string;
  identifier: string;
  version: number;
  jurisdiction: string;
  language: string;
  status: string;
  complianceScore?: number;
  owner: string;
  updatedAt: string;
  updatedBy: string;
  href: string;
}

export interface RegulatoryImpactItem {
  id: string;
  framework: string;
  jurisdiction: string;
  title: string;
  effectiveDate?: string;
  severity: 'informational' | 'action_required' | 'deadline_approaching' | 'critical';
  affectedSubstances: number;
  affectedSds: number;
  affectedLabels: number;
  requiredAction: string;
  owner: string;
  status: string;
  href: string;
}

export interface PipelineHealthSummary {
  jobsToday: number;
  successRate: number;
  averageDurationMinutes: number;
  running: number;
  waiting: number;
  failed: number;
  manualReview: number;
  deadLetter: number;
}

export interface PipelineJobSummary {
  id: string;
  inputType: string;
  relatedDocument: string;
  currentStage: string;
  progress: number;
  startedAt?: string;
  durationMinutes?: number;
  status: 'running' | 'waiting' | 'failed' | 'blocked' | 'complete';
  retryCount: number;
  href: string;
}

export interface ApprovalWorkloadSummary {
  technicalReview: number;
  regulatoryReview: number;
  finalApproval: number;
  changesRequested: number;
  overdue: number;
  averageTurnaroundHours: number;
  reviewers: Array<{
    id: string;
    name: string;
    assignedCount: number;
    overdueCount: number;
    averageCompletionHours: number;
  }>;
}

export interface UpcomingReviewItem {
  id: string;
  product: string;
  version: number;
  jurisdiction: string;
  reviewDate: string;
  owner: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  href: string;
}

export interface DataQualitySummary {
  missingSources: number;
  lowConfidenceFields: number;
  unverifiedAiValues: number;
  duplicateCandidates: number;
  missingOwner: number;
  missingReviewDate: number;
  productsWithoutPublishedSds: number;
  labelsOutOfSync: number;
}

export interface ActivityFeedItem {
  id: string;
  actor: string;
  action: string;
  objectLabel: string;
  timestamp: string;
  scope: string;
  status?: string;
  href: string;
}

export interface DashboardSummary {
  scope: DashboardScope;
  generatedAt: string;
  kpis: DashboardKpis;
  complianceTrend: ComplianceTrendPoint[];
  complianceBreakdown: ComplianceBreakdownItem[];
  lifecycleDistribution: LifecycleStatusCount[];
  myTasks: DashboardTask[];
  criticalIssues: DashboardIssue[];
  recentSdsActivity: RecentSdsActivity[];
  regulatoryImpact: RegulatoryImpactItem[];
  pipelineHealth: PipelineHealthSummary;
  recentPipelineJobs: PipelineJobSummary[];
  approvalWorkload: ApprovalWorkloadSummary;
  upcomingReviews: UpcomingReviewItem[];
  dataQuality: DataQualitySummary;
  activityFeed: ActivityFeedItem[];
}

export interface DashboardFilters {
  from?: string;
  to?: string;
  company_id?: string;
  site_id?: string;
  unit_id?: string;
  area_id?: string;
  jurisdiction?: string;
  status?: string;
  product_family?: string;
  owner_id?: string;
  language?: string;
  range?: '7d' | '30d' | '90d' | '12m';
}
