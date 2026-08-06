import { RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import {
  VisibilityMode,
  BigValueGraphMode,
  TableSortByFieldStateBuilder,
} from "@grafana/grafana-foundation-sdk/common";
import { PanelBuilder as StateTimelinePanelBuilder } from "@grafana/grafana-foundation-sdk/statetimeline";
import { PanelBuilder as StatPanelBuilder } from "@grafana/grafana-foundation-sdk/stat";
import { PanelBuilder as TablePanelBuilder } from "@grafana/grafana-foundation-sdk/table";
import { DataqueryBuilder } from "@grafana/grafana-foundation-sdk/prometheus";
import { createDashboard } from "../shared/dashboard-factory.js";
import { victoriaMetricsDS } from "../shared/datasource.js";

// New numeric template sensor (created 2025-05: stop→0, baseline→1, level1–4→2–5, etc.)
const SNOO_STATE_METRIC = "sensor.otto_snoo_state_numeric_value";
// 25h window: carries the last known state forward across the full 24h display window.
// Essential because state changes are sparse — only written on transitions, not every scrape.
const LOOKBACK_WINDOW = "25h";

const NIGHT_SERIES = [
  { refId: "A", label: "Current Night", offsetDays: 0 },
  { refId: "B", label: "1 Night Ago", offsetDays: 1 },
  { refId: "C", label: "2 Nights Ago", offsetDays: 2 },
  { refId: "D", label: "3 Nights Ago", offsetDays: 3 },
  { refId: "E", label: "4 Nights Ago", offsetDays: 4 },
  { refId: "F", label: "5 Nights Ago", offsetDays: 5 },
  { refId: "G", label: "6 Nights Ago", offsetDays: 6 },
];

function buildNightStateExpression(offsetDays: number) {
  const offset = offsetDays === 0 ? "" : ` offset ${offsetDays}d`;
  return `last_over_time({__name__="${SNOO_STATE_METRIC}"}[${LOOKBACK_WINDOW}]${offset})`;
}

// For the table: plain range query (no @ anchor) so each daily step evaluates at its own timestamp.
// With step=1d ending at now/d+9h (9AM CET), every step lands at 9AM CET → [6PM,9AM] window is correct.
const NIGHT_TABLE_EXPR = `sum_over_time((last_over_time({__name__="${SNOO_STATE_METRIC}"}[25h]) > bool 0)[15h:5m]) * 300`;

function buildNightActiveSecondsExpression(offsetDays: number) {
  // Grafana substitutes ${__to:date:seconds} with the dashboard `to` as a literal Unix timestamp
  // (seconds) before sending to VictoriaMetrics. This hard-pins the 15h subquery window to end
  // exactly at 9AM CET regardless of whether Grafana sends an instant or range query.
  // biome-ignore lint/suspicious/noTemplateCurlyInString: Grafana variable syntax, not a TS template literal
  const TO_VAR = "${__to:date:seconds}";
  const evalAt = offsetDays === 0 ? TO_VAR : `(${TO_VAR} - ${offsetDays * 86400})`;
  return `sum_over_time((last_over_time({__name__="${SNOO_STATE_METRIC}"}[25h]) > bool 0)[15h:5m] @ ${evalAt}) * 300`;
}

export function makeOttoSnooDashboard() {
  const dashboard = createDashboard({
    title: "Otto's SNOO Nights",
    uid: "otto-snoo-nights",
    tags: ["otto", "snoo", "sleep", "nursery"],
    refresh: "5m",
    from: "now/d-6h",
    to: "now/d+9h",
  });

  let currentY = 0;

  dashboard.withRow(new RowBuilder("SNOO State by Night"));
  currentY++;

  const nightStatePanel = new StateTimelinePanelBuilder()
    .title("Otto's SNOO State — Last 7 Nights (6PM → 9AM)")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 24, h: 14 })
    .timeFrom("15h")
    .showValue(VisibilityMode.Never)
    .rowHeight(0.9)
    .mergeValues(true)
    .fillOpacity(100)
    .mappings([
      {
        // biome-ignore lint/suspicious/noExplicitAny: MappingType enum not exported
        type: "value" as any,
        options: {
          "0": { text: "", color: "transparent" },
          "1": { text: "Baseline", color: "green" },
          "2": { text: "Level 1", color: "light-orange" },
          "3": { text: "Level 2", color: "orange" },
          "4": { text: "Level 3", color: "dark-orange" },
          "5": { text: "Level 4", color: "red" },
          "6": { text: "Pre-timeout", color: "yellow" },
          "7": { text: "Timeout", color: "dark-red" },
          "8": { text: "Suspended", color: "grey" },
          "9": { text: "Weaning Baseline", color: "dark-green" },
          "10": { text: "Global Settings", color: "grey" },
          "11": { text: "Unrecoverable Suspended", color: "dark-grey" },
          "12": { text: "Unrecoverable Error", color: "dark-red" },
          "13": { text: "Manual", color: "purple" },
          "14": { text: "None", color: "grey" },
          "-1": { text: "Unknown", color: "dark-grey" },
        },
      },
    ]);

  for (const night of NIGHT_SERIES) {
    nightStatePanel.withTarget(
      new DataqueryBuilder()
        .refId(night.refId)
        .expr(buildNightStateExpression(night.offsetDays))
        .datasource(victoriaMetricsDS)
        .legendFormat(night.label)
    );
  }

  dashboard.withPanel(nightStatePanel);
  currentY += 15;

  // ── Total active SNOO time per night ────────────────────────────────────────
  dashboard.withRow(new RowBuilder("Total Active Time per Night"));
  currentY++;

  const totalTimePanel = new StatPanelBuilder()
    .title("Total Active SNOO Time per Night")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 24, h: 4 })
    .graphMode(BigValueGraphMode.None)
    .unit("s");

  for (const night of NIGHT_SERIES) {
    totalTimePanel.withTarget(
      new DataqueryBuilder()
        .refId(night.refId)
        .expr(buildNightActiveSecondsExpression(night.offsetDays))
        .datasource(victoriaMetricsDS)
        .legendFormat(night.label)
    );
  }

  dashboard.withPanel(totalTimePanel);
  currentY += 5;

  // ── Per-night table: date + duration ────────────────────────────────────────
  dashboard.withRow(new RowBuilder("Nights Detail"));
  currentY++;

  const nightTablePanel = new TablePanelBuilder()
    .title("Otto's Sleep — Duration per Night")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 12, h: 10 })
    // Override panel time range to 7 days (independent of dashboard 6PM-9AM window)
    .timeFrom("7d")
    // Force daily resolution — each step lands at 9AM CET, the 15h window covers exactly one night
    .interval("1d")
    .unit("s")
    .withTarget(
      new DataqueryBuilder()
        .refId("A")
        .expr(NIGHT_TABLE_EXPR)
        .datasource(victoriaMetricsDS)
        .legendFormat("Active SNOO time")
    )
    // Format the Time column as a readable date
    .overrideByName("Time", [
      { id: "unit", value: "dateTimeAsLocal" },
      { id: "custom.width", value: 160 },
    ])
    .overrideByName("Active SNOO time", [
      { id: "displayName", value: "Duration" },
      { id: "custom.width", value: 120 },
    ])
    .sortBy([new TableSortByFieldStateBuilder().displayName("Time").desc(true)]);

  dashboard.withPanel(nightTablePanel);

  return dashboard.build();
}
