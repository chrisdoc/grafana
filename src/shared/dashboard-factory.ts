import { DashboardBuilder } from "@grafana/grafana-foundation-sdk/dashboard";

interface DashboardConfig {
  title: string;
  uid: string;
  tags: string[];
  refresh?: string;
  from?: string;
  to?: string;
}

export function createDashboard(config: DashboardConfig) {
  const { title, uid, tags, refresh = "30s", from = "now-24h", to = "now" } = config;

  return new DashboardBuilder(title)
    .uid(uid)
    .tags([...tags, "vic"]) // Always add 'vic' tag
    .refresh(refresh)
    .time({ from, to })
    .timezone("browser");
}
