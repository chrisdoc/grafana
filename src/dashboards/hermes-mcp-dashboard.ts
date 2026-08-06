import {
  BigValueGraphMode,
  TableSortByFieldStateBuilder,
  VisibilityMode,
} from "@grafana/grafana-foundation-sdk/common";
import { RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { DataqueryBuilder, PromQueryFormat } from "@grafana/grafana-foundation-sdk/prometheus";
import { PanelBuilder as StatPanelBuilder } from "@grafana/grafana-foundation-sdk/stat";
import { PanelBuilder as TablePanelBuilder } from "@grafana/grafana-foundation-sdk/table";
import {
  MetricsQueryType,
  SearchTableType,
  DataqueryBuilder as TempoDataqueryBuilder,
} from "@grafana/grafana-foundation-sdk/tempo";
import { PanelBuilder as TimeseriesPanelBuilder } from "@grafana/grafana-foundation-sdk/timeseries";
import { createDashboard } from "../shared/dashboard-factory.js";
import { tempoDS, victoriaMetricsDS } from "../shared/datasource.js";

const MCP_SERVICE = "hevy-mcp";
const CALLS_METRIC = `traces_spanmetrics_calls_total{service="${MCP_SERVICE}"}`;
const USER_CALLS_METRIC = `${CALLS_METRIC.slice(0, -1)},user_hash!=""}`;
const ERROR_CALLS_METRIC = `${CALLS_METRIC.slice(0, -1)},status_code="STATUS_CODE_ERROR"}`;
const TOOL_TRACEQL = `{ resource.service.name = "${MCP_SERVICE}" && span.mcp.tool.name != nil }`;
const TOOL_RATE_TRACEQL = `${TOOL_TRACEQL} | rate() by (span.mcp.tool.name)`;
const TOOL_COUNT_TRACEQL = `${TOOL_TRACEQL} | count_over_time() by (span.mcp.tool.name)`;
const ERROR_TOOL_TRACEQL = `{ resource.service.name = "${MCP_SERVICE}" && span.mcp.tool.name != nil && status = error }`;
const ERROR_TOOL_COUNT_TRACEQL = `${ERROR_TOOL_TRACEQL} | count_over_time() by (span.mcp.tool.name)`;
const ERROR_OPERATION_TRACEQL = `{ resource.service.name = "${MCP_SERVICE}" && status = error }`;
const ERROR_OPERATION_COUNT_TRACEQL = `${ERROR_OPERATION_TRACEQL} | count_over_time() by (name, statusMessage, span.http.status_code)`;

function activeUsers(window: string) {
  return `count(sum by (user_hash) (increase(${USER_CALLS_METRIC}[${window}])) > 0)`;
}

function prometheusStat(title: string, expr: string, x: number, w: number, unit = "none", y = 1) {
  return new StatPanelBuilder()
    .title(title)
    .datasource(victoriaMetricsDS)
    .withTarget(new DataqueryBuilder().refId("A").expr(expr).datasource(victoriaMetricsDS))
    .gridPos({ x, y, w, h: 5 })
    .unit(unit)
    .graphMode(BigValueGraphMode.Area);
}

function tempoMetricsQuery(
  refId: string,
  query: string,
  metricsQueryType: MetricsQueryType,
  step?: string
) {
  const target = new TempoDataqueryBuilder()
    .refId(refId)
    .queryType("traceql")
    .query(query)
    .metricsQueryType(metricsQueryType)
    .datasource(tempoDS);

  if (step) target.step(step);
  return target;
}

export function makeHermesMcpDashboard() {
  const dashboard = createDashboard({
    title: "Hermes MCP — Usage & Traces",
    uid: "hermes-mcp-observability",
    tags: ["hermes", "mcp", "tempo", "observability"],
    refresh: "1m",
    from: "now-30d",
  });

  // === Overview ===
  dashboard.withRow(new RowBuilder("Usage overview"));
  dashboard.withPanel(prometheusStat("Daily active users", activeUsers("1d"), 0, 4));
  dashboard.withPanel(prometheusStat("Weekly active users", activeUsers("7d"), 4, 4));
  dashboard.withPanel(prometheusStat("Monthly active users", activeUsers("30d"), 8, 4));
  dashboard.withPanel(
    prometheusStat("MCP calls (selected range)", `sum(increase(${CALLS_METRIC}[$__range]))`, 12, 6)
  );
  dashboard.withPanel(
    prometheusStat(
      "Error rate (selected range)",
      `100 * sum(increase(${ERROR_CALLS_METRIC}[$__range])) / sum(increase(${CALLS_METRIC}[$__range]))`,
      18,
      6,
      "percent"
    )
  );

  // === Active users ===
  dashboard.withRow(new RowBuilder("Active users"));
  const activeUsersPanel = new TimeseriesPanelBuilder()
    .title("Active users by rolling window")
    .description(
      "Distinct user_hash values with at least one hevy-mcp call in each rolling window."
    )
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: 7, w: 16, h: 8 })
    .unit("none")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never);

  activeUsersPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr(activeUsers("1d"))
      .datasource(victoriaMetricsDS)
      .legendFormat("DAU")
  );
  activeUsersPanel.withTarget(
    new DataqueryBuilder()
      .refId("B")
      .expr(activeUsers("7d"))
      .datasource(victoriaMetricsDS)
      .legendFormat("WAU")
  );
  activeUsersPanel.withTarget(
    new DataqueryBuilder()
      .refId("C")
      .expr(activeUsers("30d"))
      .datasource(victoriaMetricsDS)
      .legendFormat("MAU")
  );
  dashboard.withPanel(activeUsersPanel);

  const topUsersPanel = new TablePanelBuilder()
    .title("Top users by MCP calls (30d)")
    .description("User hashes are anonymized at the instrumentation layer.")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 16, y: 7, w: 8, h: 8 })
    .unit("short")
    .showHeader(true)
    .filterable(true)
    .sortBy([new TableSortByFieldStateBuilder().displayName("tool_count").desc(true)])
    .transformations([
      { id: "labelsToFields", options: { mode: "columns" } },
      { id: "merge", options: {} },
      {
        id: "organize",
        options: {
          excludeByName: { Time: true },
          indexByName: { user_hash: 0, tool_count: 1 },
          renameByName: { Value: "tool_count" },
        },
      },
      {
        id: "sortBy",
        options: { sort: [{ field: "tool_count", desc: true }] },
      },
    ]);

  topUsersPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr(`topk(20, sum by (user_hash) (increase(${USER_CALLS_METRIC}[30d])))`)
      .format(PromQueryFormat.Table)
      .instant()
      .datasource(victoriaMetricsDS)
      .legendFormat("{{user_hash}}")
  );
  dashboard.withPanel(topUsersPanel);

  // === Request health ===
  dashboard.withRow(new RowBuilder("Request health"));
  const callRatePanel = new TimeseriesPanelBuilder()
    .title("MCP call rate")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: 16, w: 12, h: 8 })
    .unit("reqps")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never);
  callRatePanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr(`sum(rate(${CALLS_METRIC}[$__rate_interval]))`)
      .datasource(victoriaMetricsDS)
      .legendFormat("all calls")
  );
  dashboard.withPanel(callRatePanel);

  const errorRatePanel = new TimeseriesPanelBuilder()
    .title("MCP error rate")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 12, y: 16, w: 12, h: 8 })
    .unit("percent")
    .min(0)
    .max(100)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never);
  errorRatePanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr(
        `100 * sum(rate(${ERROR_CALLS_METRIC}[$__rate_interval])) / sum(rate(${CALLS_METRIC}[$__rate_interval]))`
      )
      .datasource(victoriaMetricsDS)
      .legendFormat("errors")
  );
  dashboard.withPanel(errorRatePanel);

  // === Error overview ===
  dashboard.withRow(new RowBuilder("Error overview"));
  dashboard.withPanel(
    prometheusStat(
      "All error spans (selected range)",
      `sum(increase(${ERROR_CALLS_METRIC}[$__range]))`,
      0,
      6,
      "short",
      25
    )
  );

  const errorVolumePanel = new TimeseriesPanelBuilder()
    .title("All error spans over time")
    .description("All error spans from the Tempo span metrics stored in VictoriaMetrics.")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 6, y: 25, w: 10, h: 8 })
    .unit("reqps")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never);
  errorVolumePanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr(`sum(rate(${ERROR_CALLS_METRIC}[$__rate_interval]))`)
      .datasource(victoriaMetricsDS)
      .legendFormat("errors")
  );
  dashboard.withPanel(errorVolumePanel);

  const errorsByToolPanel = new TablePanelBuilder()
    .title("MCP tool errors (last 23h)")
    .description("Only spans with a span.mcp.tool.name, grouped by tool.")
    .datasource(tempoDS)
    .gridPos({ x: 16, y: 25, w: 8, h: 8 })
    .timeFrom("23h")
    .unit("short")
    .showHeader(true)
    .filterable(true)
    .sortBy([new TableSortByFieldStateBuilder().displayName("error_count").desc(true)])
    .transformations([
      { id: "labelsToFields", options: { mode: "columns" } },
      { id: "merge", options: {} },
      {
        id: "organize",
        options: {
          excludeByName: { Time: true },
          indexByName: { mcp_tool: 0, error_count: 1 },
          renameByName: {
            "span.mcp.tool.name": "mcp_tool",
            Value: "error_count",
          },
        },
      },
      {
        id: "sortBy",
        options: { sort: [{ field: "error_count", desc: true }] },
      },
    ]);
  errorsByToolPanel.withTarget(
    tempoMetricsQuery("A", ERROR_TOOL_COUNT_TRACEQL, MetricsQueryType.Instant)
  );
  dashboard.withPanel(errorsByToolPanel);

  // === Error details ===
  dashboard.withRow(new RowBuilder("Error details"));
  const errorOperationsPanel = new TablePanelBuilder()
    .title("Error spans by operation (last 23h)")
    .description(
      "Includes server, prompt, API, and MCP tool spans. HTTP status and status message are shown when present."
    )
    .datasource(tempoDS)
    .gridPos({ x: 0, y: 34, w: 24, h: 8 })
    .timeFrom("23h")
    .unit("short")
    .showHeader(true)
    .filterable(true)
    .sortBy([new TableSortByFieldStateBuilder().displayName("error_count").desc(true)])
    .transformations([
      { id: "labelsToFields", options: { mode: "columns" } },
      { id: "merge", options: {} },
      {
        id: "organize",
        options: {
          excludeByName: { Time: true },
          indexByName: {
            operation: 0,
            status_message: 1,
            http_status: 2,
            error_count: 3,
          },
          renameByName: {
            name: "operation",
            statusMessage: "status_message",
            "span.http.status_code": "http_status",
            Value: "error_count",
          },
        },
      },
      {
        id: "sortBy",
        options: { sort: [{ field: "error_count", desc: true }] },
      },
    ]);
  errorOperationsPanel.withTarget(
    tempoMetricsQuery("A", ERROR_OPERATION_COUNT_TRACEQL, MetricsQueryType.Instant)
  );
  dashboard.withPanel(errorOperationsPanel);

  // === MCP tools ===
  dashboard.withRow(new RowBuilder("MCP tools"));

  const topToolsPanel = new TablePanelBuilder()
    .title("Most-called MCP tools (last 23h)")
    .description(
      "Tempo metrics are limited to a 24-hour query window; this panel uses 23h to stay within that limit."
    )
    .datasource(tempoDS)
    .gridPos({ x: 0, y: 43, w: 10, h: 10 })
    .timeFrom("23h")
    .unit("short")
    .showHeader(true)
    .filterable(true)
    .sortBy([new TableSortByFieldStateBuilder().displayName("tool_count").desc(true)])
    .transformations([
      { id: "labelsToFields", options: { mode: "columns" } },
      { id: "merge", options: {} },
      {
        id: "organize",
        options: {
          excludeByName: { Time: true },
          indexByName: { mcp_tool: 0, tool_count: 1 },
          renameByName: {
            "span.mcp.tool.name": "mcp_tool",
            Value: "tool_count",
          },
        },
      },
      {
        id: "sortBy",
        options: { sort: [{ field: "tool_count", desc: true }] },
      },
    ]);
  topToolsPanel.withTarget(tempoMetricsQuery("A", TOOL_COUNT_TRACEQL, MetricsQueryType.Instant));
  dashboard.withPanel(topToolsPanel);

  const toolRatePanel = new TimeseriesPanelBuilder()
    .title("MCP tool call rate")
    .description("TraceQL rate grouped by span.mcp.tool.name.")
    .datasource(tempoDS)
    .gridPos({ x: 10, y: 43, w: 14, h: 10 })
    .timeFrom("23h")
    .unit("reqps")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never);
  toolRatePanel.withTarget(tempoMetricsQuery("A", TOOL_RATE_TRACEQL, MetricsQueryType.Range, "1h"));
  dashboard.withPanel(toolRatePanel);

  // === Trace drill-down ===
  dashboard.withRow(new RowBuilder("Trace drill-down"));
  const recentTracesPanel = new TablePanelBuilder()
    .title("Recent MCP tool spans")
    .description("Open a span from this table to inspect its complete Tempo trace.")
    .datasource(tempoDS)
    .gridPos({ x: 0, y: 54, w: 24, h: 12 })
    .timeFrom("23h")
    .showHeader(true)
    .filterable(true);
  recentTracesPanel.withTarget(
    new TempoDataqueryBuilder()
      .refId("A")
      .queryType("traceql")
      .query(TOOL_TRACEQL)
      .tableType(SearchTableType.Spans)
      .limit(50)
      .datasource(tempoDS)
  );
  dashboard.withPanel(recentTracesPanel);

  return dashboard.build();
}
