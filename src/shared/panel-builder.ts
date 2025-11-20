import { PanelBuilder as TimeseriesPanelBuilder } from "@grafana/grafana-foundation-sdk/timeseries";
import { PanelBuilder as StatPanelBuilder } from "@grafana/grafana-foundation-sdk/stat";
import { DataqueryBuilder } from "@grafana/grafana-foundation-sdk/prometheus";
import { VisibilityMode, BigValueGraphMode } from "@grafana/grafana-foundation-sdk/common";
import { victoriaMetricsDS } from "./datasource.js";

interface PanelConfig {
  title: string;
  metric: string;
  unit: string;
  statUnit?: string;
  yOffset: number;
  min?: number;
  max?: number;
  includeOverlay?: boolean;
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
export function createMetricPanels(config: PanelConfig) {
  const { title, metric, unit, statUnit, yOffset, min, max, includeOverlay = true } = config;

  const panels = [];

  // Build timeseries panel
  const timeseriesTargets = [
    new DataqueryBuilder()
      .refId("A")
      .expr(`{__name__="${metric}"}`)
      .datasource(victoriaMetricsDS)
      .legendFormat("Current"),
  ];

  if (includeOverlay) {
    timeseriesTargets.push(
      new DataqueryBuilder()
        .refId("B")
        .expr(`{__name__="${metric}"} offset 24h`)
        .datasource(victoriaMetricsDS)
        .legendFormat("Previous 24h")
    );
  }

  const timeseriesPanel = new TimeseriesPanelBuilder()
    .title(title)
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: yOffset, w: 18, h: 8 })
    .unit(unit)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(600000);

  // Add targets
  for (const target of timeseriesTargets) {
    timeseriesPanel.withTarget(target);
  }

  // Add min/max if provided
  if (min !== undefined) {
    timeseriesPanel.min(min);
  }
  if (max !== undefined) {
    timeseriesPanel.max(max);
  }

  // Add overlay styling if present
  if (includeOverlay) {
    timeseriesPanel.overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);
  }

  panels.push(timeseriesPanel);

  // Build stat panel
  const statQuery = new DataqueryBuilder()
    .refId("A")
    .expr(`{__name__="${metric}"}`)
    .datasource(victoriaMetricsDS);

  const statPanel = new StatPanelBuilder()
    .title(title)
    .datasource(victoriaMetricsDS)
    .withTarget(statQuery)
    .gridPos({ x: 18, y: yOffset, w: 6, h: 8 })
    .unit(statUnit || unit)
    .graphMode(BigValueGraphMode.Area);

  panels.push(statPanel);

  return panels;
}
