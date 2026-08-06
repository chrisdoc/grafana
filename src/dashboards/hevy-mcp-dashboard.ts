import { DashboardBuilder, RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { PanelBuilder as StatPanelBuilder } from "@grafana/grafana-foundation-sdk/stat";
import { PanelBuilder as TimeseriesPanelBuilder } from "@grafana/grafana-foundation-sdk/timeseries";
import { PanelBuilder as TablePanelBuilder } from "@grafana/grafana-foundation-sdk/table";
import { DataqueryBuilder } from "@grafana/grafana-foundation-sdk/prometheus";
import { TempoQueryBuilder } from "@grafana/grafana-foundation-sdk/tempo";
import { victoriaMetricsDS } from "../shared/datasource.js";

const tempoDS = { type: "tempo", uid: "efs98nkvn6txcf" };

function prometheusTarget(target: any) {
  const query = new DataqueryBuilder()
    .refId(target.refId)
    .expr(target.expr)
    .datasource(victoriaMetricsDS);
  if (target.legendFormat) query.legendFormat(target.legendFormat);
  if (target.instant || target.range === false) query.instant();
  if (target.format) query.format(target.format as any);
  return query;
}

function tempoTarget(target: any) {
  return new TempoQueryBuilder()
    .refId(target.refId)
    .query(target.query)
    .queryType(target.queryType ?? "traceql")
    .limit(target.limit ?? 1000)
    .datasource(tempoDS);
}

export function makeHevyMcpDashboard() {
  const dashboard = new DashboardBuilder("Hevy MCP Observability")
    .uid("hevy-mcp-tempo-vm-90d")
    .tags(["hevy-mcp", "observability", "tempo", "victoriametrics"])
    .refresh("30s")
    .time({ from: "now-30d", to: "now" })
    .timezone("browser")
    .editable()
    .version(1);

  dashboard.withRow(
    new RowBuilder("Usage overview").id(1).gridPos({
      h: 1,
      w: 24,
      x: 0,
      y: 0,
    })
  );

  const panel2 = new StatPanelBuilder()
    .id(2)
    .title("Active users (24h, tool/resource/prompt activity)")
    .datasource(victoriaMetricsDS)
    .gridPos({
      h: 4,
      w: 6,
      x: 0,
      y: 1,
    })
    .description(
      "Unique hashed users with tool, resource, or prompt activity in the last 24 hours."
    );
  panel2.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: 'count(\n  sum by (user_hash) (\n    increase(mcp_user_activity_total{service="hevy-mcp",user_hash!="",activity_kind=~"tool|resource|prompt"}[1d])\n  ) > 0\n)',
      instant: true,
      legendFormat: "users",
      range: false,
      refId: "A",
    })
  );
  const panel2Model = panel2.build();
  panel2Model.options = {
    colorMode: "value",
    graphMode: "area",
    justifyMode: "auto",
    orientation: "auto",
    reduceOptions: {
      calcs: ["lastNotNull"],
      fields: "",
      values: false,
    },
    textMode: "auto",
    wideLayout: true,
  };
  panel2Model.fieldConfig = {
    defaults: {
      decimals: 0,
      unit: "short",
    },
    overrides: [],
  };
  dashboard.withPanel({ build: () => panel2Model });

  const panel3 = new StatPanelBuilder()
    .id(3)
    .title("MCP tool calls (selected range)")
    .datasource(victoriaMetricsDS)
    .gridPos({
      h: 4,
      w: 6,
      x: 6,
      y: 1,
    });
  panel3.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: 'sum(increase(mcp_tool_invocations_total{service_name="hevy-mcp"}[$__range]))',
      instant: true,
      legendFormat: "tool calls",
      range: false,
      refId: "A",
    })
  );
  const panel3Model = panel3.build();
  panel3Model.options = {
    colorMode: "value",
    graphMode: "area",
    justifyMode: "auto",
    orientation: "auto",
    reduceOptions: {
      calcs: ["lastNotNull"],
      fields: "",
      values: false,
    },
    textMode: "auto",
    wideLayout: true,
  };
  panel3Model.fieldConfig = {
    defaults: {
      decimals: 0,
      unit: "short",
    },
    overrides: [],
  };
  dashboard.withPanel({ build: () => panel3Model });

  const panel4 = new StatPanelBuilder()
    .id(4)
    .title("MCP tool error rate")
    .datasource(victoriaMetricsDS)
    .gridPos({
      h: 4,
      w: 6,
      x: 12,
      y: 1,
    });
  panel4.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: '100 * sum(increase(mcp_tool_errors_total{service_name="hevy-mcp"}[$__range])) / clamp_min(sum(increase(mcp_tool_invocations_total{service_name="hevy-mcp"}[$__range])), 1)',
      instant: true,
      legendFormat: "error rate",
      range: false,
      refId: "A",
    })
  );
  const panel4Model = panel4.build();
  panel4Model.options = {
    colorMode: "value",
    graphMode: "area",
    justifyMode: "auto",
    orientation: "auto",
    reduceOptions: {
      calcs: ["lastNotNull"],
      fields: "",
      values: false,
    },
    textMode: "auto",
    wideLayout: true,
  };
  panel4Model.fieldConfig = {
    defaults: {
      decimals: 2,
      max: 100,
      min: 0,
      unit: "percent",
    },
    overrides: [],
  };
  dashboard.withPanel({ build: () => panel4Model });

  const panel5 = new StatPanelBuilder()
    .id(5)
    .title("Hevy API calls (selected range)")
    .datasource(victoriaMetricsDS)
    .gridPos({
      h: 4,
      w: 6,
      x: 18,
      y: 1,
    });
  panel5.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: 'sum(increase(hevy_api_calls_total{service_name="hevy-mcp"}[$__range]))',
      instant: true,
      legendFormat: "API calls",
      range: false,
      refId: "A",
    })
  );
  const panel5Model = panel5.build();
  panel5Model.options = {
    colorMode: "value",
    graphMode: "area",
    justifyMode: "auto",
    orientation: "auto",
    reduceOptions: {
      calcs: ["lastNotNull"],
      fields: "",
      values: false,
    },
    textMode: "auto",
    wideLayout: true,
  };
  panel5Model.fieldConfig = {
    defaults: {
      decimals: 0,
      unit: "short",
    },
    overrides: [],
  };
  dashboard.withPanel({ build: () => panel5Model });

  const panel6 = new TimeseriesPanelBuilder()
    .id(6)
    .title("Active users by rolling window (tool/resource/prompt activity)")
    .datasource(victoriaMetricsDS)
    .gridPos({
      h: 8,
      w: 12,
      x: 0,
      y: 5,
    });
  panel6.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: 'count(\n  sum by (user_hash) (\n    increase(mcp_user_activity_total{service="hevy-mcp",user_hash!="",activity_kind=~"tool|resource|prompt"}[1d])\n  ) > 0\n)',
      legendFormat: "24h",
      range: true,
      refId: "A",
    })
  );
  panel6.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: 'count(\n  sum by (user_hash) (\n    increase(mcp_user_activity_total{service="hevy-mcp",user_hash!="",activity_kind=~"tool|resource|prompt"}[7d])\n  ) > 0\n)',
      legendFormat: "7d",
      range: true,
      refId: "B",
    })
  );
  panel6.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: 'count(\n  sum by (user_hash) (\n    increase(mcp_user_activity_total{service="hevy-mcp",user_hash!="",activity_kind=~"tool|resource|prompt"}[30d])\n  ) > 0\n)',
      legendFormat: "30d",
      range: true,
      refId: "C",
    })
  );
  const panel6Model = panel6.build();
  panel6Model.options = {
    legend: {
      calcs: [],
      displayMode: "list",
      placement: "bottom",
      showLegend: true,
    },
    tooltip: {
      mode: "multi",
      sort: "desc",
    },
  };
  panel6Model.fieldConfig = {
    defaults: {
      unit: "short",
    },
    overrides: [],
  };
  dashboard.withPanel({ build: () => panel6Model });

  const panel7 = new TimeseriesPanelBuilder()
    .id(7)
    .title("Request rates")
    .datasource(victoriaMetricsDS)
    .gridPos({
      h: 8,
      w: 12,
      x: 12,
      y: 5,
    });
  panel7.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: 'sum(rate(mcp_tool_invocations_total{service_name="hevy-mcp"}[$__rate_interval]))',
      legendFormat: "tool calls/s",
      range: true,
      refId: "A",
    })
  );
  panel7.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: 'sum(rate(mcp_tool_errors_total{service_name="hevy-mcp"}[$__rate_interval]))',
      legendFormat: "tool errors/s",
      range: true,
      refId: "B",
    })
  );
  panel7.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: 'sum(rate(hevy_api_calls_total{service_name="hevy-mcp"}[$__rate_interval]))',
      legendFormat: "API calls/s",
      range: true,
      refId: "C",
    })
  );
  const panel7Model = panel7.build();
  panel7Model.options = {
    legend: {
      calcs: [],
      displayMode: "table",
      placement: "bottom",
      showLegend: true,
    },
    tooltip: {
      mode: "multi",
      sort: "desc",
    },
  };
  panel7Model.fieldConfig = {
    defaults: {
      unit: "ops",
    },
    overrides: [],
  };
  dashboard.withPanel({ build: () => panel7Model });

  dashboard.withRow(
    new RowBuilder("Bottlenecks and failures").id(8).gridPos({
      h: 1,
      w: 24,
      x: 0,
      y: 13,
    })
  );

  const panel9 = new TimeseriesPanelBuilder()
    .id(9)
    .title("p95 MCP tool latency")
    .datasource(victoriaMetricsDS)
    .gridPos({
      h: 8,
      w: 12,
      x: 0,
      y: 14,
    });
  panel9.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: 'histogram_quantile(0.95, sum by (le, tool_name) (rate(mcp_tool_duration_ms_milliseconds_bucket{service_name="hevy-mcp"}[$__rate_interval])))',
      legendFormat: "{{tool_name}}",
      range: true,
      refId: "A",
    })
  );
  const panel9Model = panel9.build();
  panel9Model.options = {
    legend: {
      calcs: [],
      displayMode: "table",
      placement: "bottom",
      showLegend: true,
    },
    tooltip: {
      mode: "multi",
      sort: "desc",
    },
  };
  panel9Model.fieldConfig = {
    defaults: {
      unit: "ms",
    },
    overrides: [],
  };
  dashboard.withPanel({ build: () => panel9Model });

  const panel10 = new TimeseriesPanelBuilder()
    .id(10)
    .title("p95 Hevy API latency")
    .datasource(victoriaMetricsDS)
    .gridPos({
      h: 8,
      w: 12,
      x: 12,
      y: 14,
    });
  panel10.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: 'histogram_quantile(0.95, sum by (le, endpoint) (rate(hevy_api_duration_ms_milliseconds_bucket{service_name="hevy-mcp"}[$__rate_interval])))',
      legendFormat: "{{endpoint}}",
      range: true,
      refId: "A",
    })
  );
  const panel10Model = panel10.build();
  panel10Model.options = {
    legend: {
      calcs: [],
      displayMode: "table",
      placement: "bottom",
      showLegend: true,
    },
    tooltip: {
      mode: "multi",
      sort: "desc",
    },
  };
  panel10Model.fieldConfig = {
    defaults: {
      unit: "ms",
    },
    overrides: [],
  };
  dashboard.withPanel({ build: () => panel10Model });

  const panel11 = new TablePanelBuilder()
    .id(11)
    .title("Most-used MCP tools")
    .datasource(victoriaMetricsDS)
    .gridPos({
      h: 8,
      w: 8,
      x: 0,
      y: 22,
    });
  panel11.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: 'topk(15, sum by (tool_name) (increase(mcp_tool_invocations_total{service_name="hevy-mcp"}[$__range])))',
      format: "table",
      instant: true,
      legendFormat: "{{tool_name}}",
      range: false,
      refId: "A",
    })
  );
  const panel11Model = panel11.build();
  panel11Model.options = {
    footer: {
      enablePagination: true,
      fields: "",
      reducer: ["sum"],
      show: false,
    },
    showHeader: true,
  };
  panel11Model.fieldConfig = {
    defaults: {
      unit: "short",
    },
    overrides: [],
  };
  dashboard.withPanel({ build: () => panel11Model });

  const panel12 = new TablePanelBuilder()
    .id(12)
    .title("Failing API endpoints")
    .datasource(victoriaMetricsDS)
    .gridPos({
      h: 8,
      w: 8,
      x: 8,
      y: 22,
    });
  panel12.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: 'topk(15, sum by (endpoint, status_code) (increase(hevy_api_calls_total{service_name="hevy-mcp",status_code=~"4..|5.."}[$__range])))',
      format: "table",
      instant: true,
      legendFormat: "{{endpoint}} {{status_code}}",
      range: false,
      refId: "A",
    })
  );
  const panel12Model = panel12.build();
  panel12Model.options = {
    footer: {
      enablePagination: true,
      fields: "",
      reducer: ["sum"],
      show: false,
    },
    showHeader: true,
  };
  panel12Model.fieldConfig = {
    defaults: {
      unit: "short",
    },
    overrides: [],
  };
  dashboard.withPanel({ build: () => panel12Model });

  const panel13 = new TablePanelBuilder()
    .id(13)
    .title("Tool errors from traces")
    .datasource(tempoDS)
    .gridPos({
      h: 8,
      w: 8,
      x: 16,
      y: 22,
    });
  panel13.withTarget(
    tempoTarget({
      datasource: {
        type: "tempo",
        uid: "efs98nkvn6txcf",
      },
      limit: 20,
      query:
        '{ resource.service.name = "hevy-mcp" && span.mcp.tool.name != nil && status = error } | count_over_time() by (span.mcp.tool.name)',
      queryType: "traceql",
      refId: "A",
    })
  );
  const panel13Model = panel13.build();
  panel13Model.options = {
    footer: {
      enablePagination: true,
      fields: "",
      reducer: ["sum"],
      show: false,
    },
    showHeader: true,
  };
  panel13Model.fieldConfig = {
    defaults: {},
    overrides: [],
  };
  dashboard.withPanel({ build: () => panel13Model });

  dashboard.withRow(
    new RowBuilder("Service versions").id(14).gridPos({
      h: 1,
      w: 24,
      x: 0,
      y: 30,
    })
  );

  const panel15 = new TablePanelBuilder()
    .id(15)
    .title("Service version usage")
    .datasource(victoriaMetricsDS)
    .gridPos({
      h: 8,
      w: 10,
      x: 0,
      y: 31,
    })
    .description("Tool-call activity grouped by emitted service.version.");
  panel15.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: 'sort_desc(sum by (service_version) (increase(mcp_tool_invocations_total{service_name="hevy-mcp",service_version!=""}[$__range])))',
      format: "table",
      instant: true,
      legendFormat: "{{service_version}}",
      range: false,
      refId: "A",
    })
  );
  const panel15Model = panel15.build();
  panel15Model.options = {
    footer: {
      enablePagination: true,
      fields: "",
      reducer: ["sum"],
      show: false,
    },
    showHeader: true,
  };
  panel15Model.fieldConfig = {
    defaults: {
      unit: "short",
    },
    overrides: [],
  };
  dashboard.withPanel({ build: () => panel15Model });

  const panel16 = new TimeseriesPanelBuilder()
    .id(16)
    .title("Service version activity over time")
    .datasource(victoriaMetricsDS)
    .gridPos({
      h: 8,
      w: 14,
      x: 10,
      y: 31,
    })
    .description(
      "Per-version MCP tool call rate. Older versions remain visible for the selected retention window."
    );
  panel16.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: 'sum by (service_version) (rate(mcp_tool_invocations_total{service_name="hevy-mcp",service_version!=""}[$__rate_interval]))',
      legendFormat: "{{service_version}}",
      range: true,
      refId: "A",
    })
  );
  const panel16Model = panel16.build();
  panel16Model.options = {
    legend: {
      calcs: ["lastNotNull"],
      displayMode: "table",
      placement: "right",
      showLegend: true,
    },
    tooltip: {
      mode: "multi",
      sort: "desc",
    },
  };
  panel16Model.fieldConfig = {
    defaults: {
      unit: "ops",
    },
    overrides: [],
  };
  dashboard.withPanel({ build: () => panel16Model });

  dashboard.withRow(
    new RowBuilder("Trace drill-down").id(17).gridPos({
      h: 1,
      w: 24,
      x: 0,
      y: 39,
    })
  );

  const panel18 = new TablePanelBuilder()
    .id(18)
    .title("Recent MCP tool spans")
    .datasource(tempoDS)
    .gridPos({
      h: 9,
      w: 24,
      x: 0,
      y: 40,
    });
  panel18.withTarget(
    tempoTarget({
      datasource: {
        type: "tempo",
        uid: "efs98nkvn6txcf",
      },
      limit: 50,
      query: '{ resource.service.name = "hevy-mcp" && span.mcp.tool.name != nil }',
      queryType: "traceql",
      refId: "A",
    })
  );
  const panel18Model = panel18.build();
  panel18Model.options = {
    footer: {
      enablePagination: true,
      fields: "",
      reducer: ["sum"],
      show: false,
    },
    showHeader: true,
  };
  panel18Model.fieldConfig = {
    defaults: {},
    overrides: [],
  };
  dashboard.withPanel({ build: () => panel18Model });

  dashboard.withRow(
    new RowBuilder("Telemetry cost and cardinality").id(19).gridPos({
      h: 1,
      w: 24,
      x: 0,
      y: 49,
    })
  );

  const panel20 = new StatPanelBuilder()
    .id(20)
    .title("Native metric sample rows")
    .datasource(victoriaMetricsDS)
    .gridPos({
      h: 6,
      w: 8,
      x: 0,
      y: 50,
    })
    .description(
      "Number of retained metric samples in the selected range. This counts stored sample rows, not logical requests or events."
    );
  panel20.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: 'sum(count_over_time({service_name="hevy-mcp"}[$__range]))',
      instant: true,
      legendFormat: "metric samples",
      range: false,
      refId: "A",
    })
  );
  const panel20Model = panel20.build();
  panel20Model.options = {
    colorMode: "value",
    graphMode: "area",
    justifyMode: "auto",
    orientation: "auto",
    reduceOptions: {
      calcs: ["lastNotNull"],
      fields: "",
      values: false,
    },
    textMode: "auto",
    wideLayout: true,
  };
  panel20Model.fieldConfig = {
    defaults: {
      decimals: 0,
      unit: "short",
    },
    overrides: [],
  };
  dashboard.withPanel({ build: () => panel20Model });

  const panel21 = new StatPanelBuilder()
    .id(21)
    .title("Active Hevy metric series")
    .datasource(victoriaMetricsDS)
    .gridPos({
      h: 6,
      w: 8,
      x: 8,
      y: 50,
    })
    .description(
      "Current number of native Hevy metric series. Histograms contribute one series per bucket and label set."
    );
  panel21.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: 'count({service_name="hevy-mcp"})',
      instant: true,
      legendFormat: "active series",
      range: false,
      refId: "A",
    })
  );
  const panel21Model = panel21.build();
  panel21Model.options = {
    colorMode: "value",
    graphMode: "area",
    justifyMode: "auto",
    orientation: "auto",
    reduceOptions: {
      calcs: ["lastNotNull"],
      fields: "",
      values: false,
    },
    textMode: "auto",
    wideLayout: true,
  };
  panel21Model.fieldConfig = {
    defaults: {
      decimals: 0,
      unit: "short",
    },
    overrides: [],
  };
  dashboard.withPanel({ build: () => panel21Model });

  const panel22 = new StatPanelBuilder()
    .id(22)
    .title("Histogram sample share")
    .datasource(victoriaMetricsDS)
    .gridPos({
      h: 6,
      w: 8,
      x: 16,
      y: 50,
    })
    .description(
      "Share of selected-range native metric samples emitted by latency histogram buckets. A high value indicates storage is dominated by histogram bucket rows rather than logical event counters."
    );
  panel22.withTarget(
    prometheusTarget({
      editorMode: "code",
      expr: '100 * sum(count_over_time({__name__=~"mcp_tool_duration_ms_milliseconds_bucket|hevy_api_duration_ms_milliseconds_bucket",service_name="hevy-mcp"}[$__range])) / clamp_min(sum(count_over_time({service_name="hevy-mcp"}[$__range])), 1)',
      instant: true,
      legendFormat: "histogram bucket share",
      range: false,
      refId: "A",
    })
  );
  const panel22Model = panel22.build();
  panel22Model.options = {
    legend: {
      calcs: [],
      displayMode: "list",
      placement: "bottom",
      showLegend: true,
    },
    tooltip: {
      mode: "single",
      sort: "desc",
    },
  };
  panel22Model.fieldConfig = {
    defaults: {
      decimals: 2,
      max: 100,
      min: 0,
      unit: "percent",
    },
    overrides: [],
  };
  dashboard.withPanel({ build: () => panel22Model });

  return dashboard.build();
}
