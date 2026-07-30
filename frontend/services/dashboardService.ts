import api from '@/lib/api';
import { dashboardSummarySchema } from '@/lib/dashboard/dashboard-schema';
import type { DashboardFilters, DashboardSummary } from '@/lib/dashboard/dashboard-types';

const dashboardService = {
  async getSummary(filters: DashboardFilters = {}): Promise<DashboardSummary> {
    const { data } = await api.get('/dashboard/summary', { params: filters });
    return dashboardSummarySchema.parse(data.data);
  },
};

export default dashboardService;
