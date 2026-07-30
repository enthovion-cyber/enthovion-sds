const { supabaseAdmin } = require('../../config/database');

const lifecycleStatuses = [
  ['draft', 'Draft'],
  ['submitted', 'Submitted'],
  ['technical_review', 'In technical review'],
  ['regulatory_review', 'In regulatory review'],
  ['changes_requested', 'Changes requested'],
  ['approved', 'Approved'],
  ['published', 'Published'],
  ['expired', 'Expired'],
  ['superseded', 'Superseded'],
  ['archived', 'Archived'],
];

const normalizeRole = (role) => {
  if (role === 'admin' || role === 'ehs_manager') return role;
  return 'worker';
};

const metric = (value, status = 'neutral', href) => ({
  value,
  previousValue: value,
  percentChange: 0,
  trend: 'flat',
  status,
  href,
});

const statusMap = {
  pending_review: 'submitted',
  review: 'technical_review',
  in_review: 'technical_review',
};

const isActiveStatus = (status) => status !== 'archived';

const parseDate = (value) => (value ? new Date(value) : null);

const buildBaseQuery = ({ userId, filters, select, count = false }) => {
  let query = supabaseAdmin
    .from('sds_documents')
    .select(select, count ? { count: 'exact' } : undefined)
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.jurisdiction) query = query.eq('jurisdiction', filters.jurisdiction);
  if (filters.language) query = query.eq('language', filters.language);
  if (filters.owner_id) query = query.eq('user_id', filters.owner_id);
  if (filters.from) query = query.gte('updated_at', filters.from);
  if (filters.to) query = query.lte('updated_at', filters.to);

  return query;
};

const querySds = async (user, filters) => {
  const { data, error } = await buildBaseQuery({
    userId: user.userId,
    filters,
    select: 'id,chemical_name,cas_number,language,jurisdiction,status,version,compliance_score,expires_at,created_at,updated_at,user_id',
  }).order('updated_at', { ascending: false }).limit(100);

  if (error) throw error;
  return data || [];
};

const buildCriticalIssues = (documents) => {
  return documents
    .filter((doc) => Number(doc.compliance_score || 0) > 0 && Number(doc.compliance_score || 0) < 60)
    .slice(0, 7)
    .map((doc) => ({
      id: `low-score-${doc.id}`,
      title: 'Compliance score below critical threshold',
      severity: 'critical',
      source: 'compliance',
      ruleId: 'COMPLIANCE_SCORE_MINIMUM',
      sdsId: doc.id,
      sdsName: doc.chemical_name || 'Untitled SDS',
      sectionNumber: undefined,
      jurisdiction: doc.jurisdiction || 'Unspecified',
      ownerName: userLabel(doc.user_id),
      detectedAt: doc.updated_at || doc.created_at || new Date().toISOString(),
      status: 'open',
      href: `/sds/${doc.id}`,
    }));
};

const userLabel = () => 'Current owner';

const buildTasks = (documents) => {
  const now = new Date();
  const inThirty = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const tasks = [];

  documents.forEach((doc) => {
    if (doc.status === 'pending_review' || doc.status === 'submitted') {
      tasks.push({
        id: `review-${doc.id}`,
        type: 'technical_review',
        title: 'SDS awaiting review',
        relatedEntityLabel: doc.chemical_name || 'Untitled SDS',
        priority: 'high',
        status: 'open',
        dueAt: doc.updated_at,
        assignedRole: 'Reviewer',
        href: `/sds/${doc.id}`,
        actionLabel: 'Review SDS',
      });
    }

    if (doc.expires_at) {
      const expiresAt = parseDate(doc.expires_at);
      if (expiresAt && expiresAt <= inThirty) {
        tasks.push({
          id: `expiry-${doc.id}`,
          type: 'sds_expiry_review',
          title: expiresAt < now ? 'Expired SDS requires review' : 'SDS review due soon',
          relatedEntityLabel: doc.chemical_name || 'Untitled SDS',
          priority: expiresAt < now ? 'critical' : 'medium',
          status: expiresAt < now ? 'overdue' : 'open',
          dueAt: doc.expires_at,
          assignedRole: 'EHS manager',
          href: `/sds/${doc.id}`,
          actionLabel: 'Review now',
        });
      }
    }
  });

  const priorityScore = { critical: 0, high: 1, medium: 2, low: 3 };
  return tasks.sort((a, b) => priorityScore[a.priority] - priorityScore[b.priority]).slice(0, 6);
};

const buildComplianceTrend = (documents) => {
  const now = new Date();
  const baseScore = documents.length
    ? Math.round(documents.reduce((sum, doc) => sum + Number(doc.compliance_score || 0), 0) / documents.length)
    : 0;

  return Array.from({ length: 7 }).map((_, index) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (6 - index));
    return {
      date: day.toISOString(),
      score: baseScore,
      threshold: 85,
    };
  });
};

const getDashboardSummary = async ({ user, filters }) => {
  const documents = await querySds(user, filters);
  const activeDocuments = documents.filter((doc) => isActiveStatus(doc.status));
  const approvedCount = activeDocuments.filter((doc) => doc.status === 'approved').length;
  const now = new Date();
  const inThirty = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiring = activeDocuments.filter((doc) => {
    const expiresAt = parseDate(doc.expires_at);
    return expiresAt && expiresAt <= inThirty;
  });
  const criticalIssues = buildCriticalIssues(activeDocuments);
  const avgCompliance = activeDocuments.length
    ? Math.round(activeDocuments.reduce((sum, doc) => sum + Number(doc.compliance_score || 0), 0) / activeDocuments.length)
    : 0;
  const lifecycleDistribution = lifecycleStatuses.map(([status, label]) => ({
    status,
    label,
    count: activeDocuments.filter((doc) => (statusMap[doc.status] || doc.status) === status).length,
  }));

  return {
    scope: {
      organizationName: user.company || 'SafeSheet AI workspace',
      siteName: filters.site_id ? 'Selected site' : undefined,
      role: normalizeRole(user.role),
    },
    generatedAt: new Date().toISOString(),
    kpis: {
      totalSds: metric(activeDocuments.length, 'neutral', '/sds'),
      approvedSds: metric(approvedCount, approvedCount === activeDocuments.length && activeDocuments.length > 0 ? 'good' : 'neutral', '/sds?status=approved'),
      complianceScore: metric(avgCompliance, avgCompliance >= 85 ? 'good' : avgCompliance >= 60 ? 'warning' : 'critical', '/compliance'),
      criticalIssues: metric(criticalIssues.length, criticalIssues.length > 0 ? 'critical' : 'good', '/validation?severity=critical&status=open'),
      pendingApprovals: metric(activeDocuments.filter((doc) => ['pending_review', 'submitted'].includes(doc.status)).length, 'warning', '/sds?status=pending_review'),
      expiringSoon: metric(expiring.length, expiring.length > 0 ? 'warning' : 'good', '/dashboard/expiring?days=30'),
      regulatoryImpact: metric(0, 'good', '/regulatory?impact=affected'),
      pipelineHealth: metric(100, 'good', '/pipeline'),
    },
    complianceTrend: buildComplianceTrend(activeDocuments),
    complianceBreakdown: [
      ['document_completeness', 'Document completeness'],
      ['hazard_classification', 'Hazard classification'],
      ['label_alignment', 'Label alignment'],
      ['exposure_information', 'Exposure information'],
      ['transport_information', 'Transport information'],
      ['jurisdiction_requirements', 'Jurisdiction requirements'],
      ['source_reliability', 'Source reliability'],
    ].map(([key, label]) => ({
      key,
      label,
      score: avgCompliance,
      change: 0,
      status: avgCompliance >= 85 ? 'good' : avgCompliance >= 60 ? 'warning' : 'critical',
      href: '/compliance',
    })),
    lifecycleDistribution,
    myTasks: buildTasks(activeDocuments),
    criticalIssues,
    recentSdsActivity: documents.slice(0, 8).map((doc) => ({
      id: doc.id,
      product: doc.chemical_name || 'Untitled SDS',
      identifier: doc.cas_number || doc.id.slice(0, 8),
      version: Number(doc.version || 1),
      jurisdiction: doc.jurisdiction || 'Unspecified',
      language: doc.language || 'en',
      status: doc.status || 'draft',
      complianceScore: doc.compliance_score == null ? undefined : Number(doc.compliance_score),
      owner: 'Current owner',
      updatedAt: doc.updated_at || doc.created_at || new Date().toISOString(),
      updatedBy: 'SafeSheet AI',
      href: `/sds/${doc.id}`,
    })),
    regulatoryImpact: [],
    pipelineHealth: {
      jobsToday: 0,
      successRate: 100,
      averageDurationMinutes: 0,
      running: 0,
      waiting: 0,
      failed: 0,
      manualReview: 0,
      deadLetter: 0,
    },
    recentPipelineJobs: [],
    approvalWorkload: {
      technicalReview: activeDocuments.filter((doc) => ['pending_review', 'submitted'].includes(doc.status)).length,
      regulatoryReview: 0,
      finalApproval: 0,
      changesRequested: activeDocuments.filter((doc) => doc.status === 'changes_requested').length,
      overdue: 0,
      averageTurnaroundHours: 0,
      reviewers: [],
    },
    upcomingReviews: expiring.slice(0, 8).map((doc) => ({
      id: doc.id,
      product: doc.chemical_name || 'Untitled SDS',
      version: Number(doc.version || 1),
      jurisdiction: doc.jurisdiction || 'Unspecified',
      reviewDate: doc.expires_at,
      owner: 'Current owner',
      riskLevel: parseDate(doc.expires_at) < now ? 'critical' : 'medium',
      href: `/sds/${doc.id}`,
    })),
    dataQuality: {
      missingSources: 0,
      lowConfidenceFields: 0,
      unverifiedAiValues: 0,
      duplicateCandidates: 0,
      missingOwner: 0,
      missingReviewDate: activeDocuments.filter((doc) => !doc.expires_at).length,
      productsWithoutPublishedSds: activeDocuments.filter((doc) => doc.status !== 'approved' && doc.status !== 'published').length,
      labelsOutOfSync: 0,
    },
    activityFeed: documents.slice(0, 8).map((doc) => ({
      id: `activity-${doc.id}`,
      actor: 'SafeSheet AI',
      action: doc.status === 'approved' ? 'approved' : 'updated',
      objectLabel: doc.chemical_name || 'Untitled SDS',
      timestamp: doc.updated_at || doc.created_at || new Date().toISOString(),
      scope: filters.site_id ? 'Selected site' : 'Organization',
      status: doc.status || 'draft',
      href: `/sds/${doc.id}`,
    })),
  };
};

module.exports = { getDashboardSummary };
