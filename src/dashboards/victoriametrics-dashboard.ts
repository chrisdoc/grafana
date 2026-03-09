import { RowBuilder, QueryVariableBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { BigValueGraphMode } from "@grafana/grafana-foundation-sdk/common";
import { PanelBuilder as TimeseriesPanelBuilder } from "@grafana/grafana-foundation-sdk/timeseries";
import { PanelBuilder as StatPanelBuilder } from "@grafana/grafana-foundation-sdk/stat";
import { DataqueryBuilder } from "@grafana/grafana-foundation-sdk/prometheus";
import { VisibilityMode } from "@grafana/grafana-foundation-sdk/common";
import { createDashboard } from "../shared/dashboard-factory.js";
import { createStatPanel } from "../shared/panel-builder.js";
import { victoriaMetricsDS } from "../shared/datasource.js";

const NULL_THRESHOLD_MS = 600_000; // 10 minutes

export function makeVictoriaMetricsDashboard() {
  const dashboard = createDashboard({
    title: "VictoriaMetrics",
    uid: "victoriametrics",
    tags: ["victoriametrics", "monitoring", "database"],
    refresh: "30s",
  });

  // Variables for troubleshooting
  dashboard.withVariable(
    new QueryVariableBuilder("job")
      .label("Job")
      .datasource(victoriaMetricsDS)
      .query("label_values(up, job)")
      .includeAll(true)
      .regex("/victoriametrics/")
      .current({ text: "victoriametrics", value: "victoriametrics", selected: true })
  );

  dashboard.withVariable(
    new QueryVariableBuilder("instance")
      .label("Instance")
      .datasource(victoriaMetricsDS)
      .query('label_values(up{job="$job"}, instance)')
      .includeAll(true)
      .regex("/victoriametrics/")
      .current({ text: "victoriametrics", value: "victoriametrics", selected: true })
  );

  let currentY = 0;

  // === Overview ===
  dashboard.withRow(new RowBuilder("Overview"));
  currentY++;

  // Text panel explaining missing data
  dashboard.withPanel(
    createStatPanel({
      title: "Data Status",
      metric: "scalar(sum(vm_rows_inserted_total)) or 0",
      unit: "none",
      x: 0,
      y: currentY,
      w: 24,
      h: 2,
      graphMode: BigValueGraphMode.None,
    }).mappings([
      { type: "value", options: { "0": { text: "No Data Found - Check Scraper", color: "red" } } },
      {
        type: "range",
        options: { from: 1, to: 999999999999, result: { text: "Data Available", color: "green" } },
      },
    ])
  );
  currentY += 2;

  // Ingestion Rate
  const ingestionRatePanel = new TimeseriesPanelBuilder()
    .title("Ingestion Rate")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 12, h: 8 })
    .unit("row/s")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  ingestionRatePanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr('sum(rate(vm_rows_inserted_total{job=~"$job", instance=~"$instance"}[5m]))')
      .datasource(victoriaMetricsDS)
      .legendFormat("Total Ingestion Rate")
  );

  dashboard.withPanel(ingestionRatePanel);

  // Active Time Series
  const activeSeriesPanel = new TimeseriesPanelBuilder()
    .title("Active Time Series")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 12, y: currentY, w: 12, h: 8 })
    .unit("none")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  activeSeriesPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr('sum(vm_active_time_series{job=~"$job", instance=~"$instance"})')
      .datasource(victoriaMetricsDS)
      .legendFormat("Active Series")
  );

  dashboard.withPanel(activeSeriesPanel);
  currentY += 8;

  // Overview Stats
  dashboard.withPanel(
    createStatPanel({
      title: "Total Datapoints",
      metric: 'sum(vm_rows{job=~"$job", instance=~"$instance", type!~"indexdb.*"})',
      unit: "short",
      x: 0,
      y: currentY,
      w: 6,
      h: 4,
      graphMode: BigValueGraphMode.Area,
    })
  );

  dashboard.withPanel(
    createStatPanel({
      title: "Ingestion Rate",
      metric: 'sum(rate(vm_rows_inserted_total{job=~"$job", instance=~"$instance"}[5m]))',
      unit: "row/s",
      x: 6,
      y: currentY,
      w: 6,
      h: 4,
      graphMode: BigValueGraphMode.Area,
    })
  );

  dashboard.withPanel(
    createStatPanel({
      title: "Read Requests",
      metric:
        'sum(rate(vm_http_requests_total{job=~"$job", instance=~"$instance", path!~".*(/write|/metrics)"}[5m]))',
      unit: "req/s",
      x: 12,
      y: currentY,
      w: 6,
      h: 4,
      graphMode: BigValueGraphMode.Area,
    })
  );

  dashboard.withPanel(
    createStatPanel({
      title: "Available Memory",
      metric: 'sum(vm_available_memory_bytes{job=~"$job", instance=~"$instance"})',
      unit: "bytes",
      x: 18,
      y: currentY,
      w: 6,
      h: 4,
      graphMode: BigValueGraphMode.None,
    })
  );
  currentY += 4;

  // === Ingestion Health ===
  dashboard.withRow(new RowBuilder("Ingestion Health"));
  currentY++;

  const invalidRowsPanel = new TimeseriesPanelBuilder()
    .title("Dropped Rows (Errors & Warnings)")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 24, h: 8 })
    .unit("row/s")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  // Errors (Invalid)
  invalidRowsPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr(
        'sum by(type) (rate(vm_rows_invalid_total{job=~"$job", instance=~"$instance"}[5m])) > 0'
      )
      .datasource(victoriaMetricsDS)
      .legendFormat("Invalid: {{type}}")
  );

  // Warnings (Ignored)
  invalidRowsPanel.withTarget(
    new DataqueryBuilder()
      .refId("B")
      .expr(
        'sum by(reason) (rate(vm_rows_ignored_total{job=~"$job", instance=~"$instance"}[5m])) > 0'
      )
      .datasource(victoriaMetricsDS)
      .legendFormat("Ignored: {{reason}}")
  );

  dashboard.withPanel(invalidRowsPanel);
  currentY += 8;

  // === Target Status ===
  dashboard.withRow(new RowBuilder("Target Status"));
  currentY++;

  const upPanel = new TimeseriesPanelBuilder()
    .title("Up")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 24, h: 8 })
    .unit("none")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  upPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr("up")
      .datasource(victoriaMetricsDS)
      .legendFormat("{{job}} ({{instance}})")
  );

  dashboard.withPanel(upPanel);
  currentY += 8;

  // === Resource Usage ===
  dashboard.withRow(new RowBuilder("Resource Usage"));
  currentY++;

  // CPU Usage
  const cpuPanel = new TimeseriesPanelBuilder()
    .title("CPU Usage")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 12, h: 8 })
    .unit("percent")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  cpuPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr('rate(process_cpu_seconds_total{job=~"$job", instance=~"$instance"}[5m]) * 100')
      .datasource(victoriaMetricsDS)
      .legendFormat("CPU Usage")
  );

  dashboard.withPanel(cpuPanel);

  // Memory Usage
  const memoryPanel = new TimeseriesPanelBuilder()
    .title("Memory Usage")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 12, y: currentY, w: 12, h: 8 })
    .unit("bytes")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  memoryPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr('process_resident_memory_bytes{job=~"$job", instance=~"$instance"}')
      .datasource(victoriaMetricsDS)
      .legendFormat("Resident Memory")
  );

  memoryPanel.withTarget(
    new DataqueryBuilder()
      .refId("B")
      .expr('go_memstats_alloc_bytes{job=~"$job", instance=~"$instance"}')
      .datasource(victoriaMetricsDS)
      .legendFormat("Go Alloc")
  );

  dashboard.withPanel(memoryPanel);
  currentY += 8;

  return dashboard.build();
}
