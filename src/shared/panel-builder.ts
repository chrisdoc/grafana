import { PanelBuilder as TimeseriesPanelBuilder } from "@grafana/grafana-foundation-sdk/timeseries";
import { PanelBuilder as StatPanelBuilder } from "@grafana/grafana-foundation-sdk/stat";
import { DataqueryBuilder } from "@grafana/grafana-foundation-sdk/prometheus";
import { VisibilityMode, BigValueGraphMode } from "@grafana/grafana-foundation-sdk/common";
import { victoriaMetricsDS } from "./datasource.js";

// biome-ignore lint/suspicious/noExplicitAny: MappingType enum is not exported
type MappingType = any;

// --- Constants ---

const LAYOUT = {
  TIMESERIES_W: 18,
  STAT_W: 6,
  HEIGHT: 8,
};

const NULL_THRESHOLD_MS = 600_000; // 10 minutes
const OVERLAY_COLOR = "#555555";

// --- Types ---

export interface TimeseriesPanelConfig {
  title: string;
  metric: string;
  unit?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  min?: number;
  max?: number;
  includeOverlay?: boolean;
  legendFormat?: string;
  fillOpacity?: number;
  showPoints?: VisibilityMode;
}

interface MetricPanelConfig {
  title: string;
  metric: string;
  unit: string;
  statUnit?: string;
  yOffset: number;
  min?: number;
  max?: number;
  includeOverlay?: boolean;
}

interface StatPanelConfig {
  title: string;
  metric: string; // Can be a metric name or a full PromQL expression
  unit?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  graphMode?: BigValueGraphMode;
  mappings?: MappingType[];
}

/**
 * Creates a two-panel layout (timeseries + stat) for metrics
 * Pattern: Timeseries (18x8) on left + Stat (6x8) on right = 24 width
 *
 * Features:
 * - Automatic null value connection (10-minute threshold via build.ts)
 * - Previous 24h overlay (optional) with dashed grey line styling
 * - Consistent formatting across all dashboards
 */
export function createMetricPanels(config: MetricPanelConfig) {
  const { title, metric, unit, yOffset, min, max, includeOverlay = true } = config;

  const timeseries = createTimeseriesPanel({
    title,
    metric,
    unit,
    x: 0,
    y: yOffset,
    w: LAYOUT.TIMESERIES_W,
    h: LAYOUT.HEIGHT,
    min,
    max,
    includeOverlay,
  });

  const stat = createSideStatPanel(config);

  return [timeseries, stat];
}

/**
 * Creates a standalone Stat panel with standard defaults
 */
export function createStatPanel(config: StatPanelConfig) {
  const {
    title,
    metric,
    unit = "none",
    x = 0,
    y = 0,
    w = 6,
    h = 8,
    graphMode = BigValueGraphMode.Area,
    mappings,
  } = config;

  // Check if metric is a raw metric name or an expression
  const isExpression = metric.includes("{") || metric.includes(" ") || metric.includes("(");
  const expr = isExpression ? metric : `{__name__="${metric}"}`;

  const panel = new StatPanelBuilder()
    .title(title)
    .datasource(victoriaMetricsDS)
    .withTarget(new DataqueryBuilder().refId("A").expr(expr).datasource(victoriaMetricsDS))
    .gridPos({ x, y, w, h })
    .unit(unit)
    .graphMode(graphMode);

  if (mappings) {
    panel.mappings(mappings);
  }

  return panel;
}

/**
 * Creates a standalone Timeseries panel with standard defaults
 */
export function createTimeseriesPanel(config: TimeseriesPanelConfig) {
  const {
    title,
    metric,
    unit = "none",
    x = 0,
    y = 0,
    w = 24,
    h = 8,
    min,
    max,
    includeOverlay = false,
    legendFormat = "Current",
    fillOpacity = 10,
    showPoints = VisibilityMode.Never,
  } = config;

  const panel = new TimeseriesPanelBuilder()
    .title(title)
    .datasource(victoriaMetricsDS)
    .gridPos({ x, y, w, h })
    .unit(unit)
    .lineWidth(2)
    .fillOpacity(fillOpacity)
    .showPoints(showPoints)
    .spanNulls(NULL_THRESHOLD_MS);

  // Current value target
  panel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr(`{__name__="${metric}"}`)
      .datasource(victoriaMetricsDS)
      .legendFormat(legendFormat)
  );

  // Previous 24h overlay
  if (includeOverlay) {
    panel.withTarget(
      new DataqueryBuilder()
        .refId("B")
        .expr(`{__name__="${metric}"} offset 24h`)
        .datasource(victoriaMetricsDS)
        .legendFormat("Previous 24h")
    );

    panel.overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: OVERLAY_COLOR } },
    ]);
  }

  if (min !== undefined) {
    panel.min(min);
  }
  if (max !== undefined) {
    panel.max(max);
  }

  return panel;
}

function createSideStatPanel(config: MetricPanelConfig) {
  const { title, metric, unit, statUnit, yOffset } = config;

  return createStatPanel({
    title,
    metric,
    unit: statUnit || unit,
    x: LAYOUT.TIMESERIES_W,
    y: yOffset,
    w: LAYOUT.STAT_W,
    h: LAYOUT.HEIGHT,
    graphMode: BigValueGraphMode.Area,
  });
}
