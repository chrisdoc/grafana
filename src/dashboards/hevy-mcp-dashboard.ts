/**
 * Hevy MCP observability dashboard.
 *
 * This model is intentionally kept close to the Grafana JSON model because it
 * includes Tempo TraceQL targets as well as VictoriaMetrics PromQL targets.
 */
export function makeHevyMcpDashboard() {
  return {
    annotations: {
      list: [],
    },
    editable: true,
    fiscalYearStartMonth: 0,
    graphTooltip: 1,
    links: [],
    panels: [
      {
        collapsed: false,
        gridPos: {
          h: 1,
          w: 24,
          x: 0,
          y: 0,
        },
        id: 1,
        panels: [],
        title: "Usage overview",
        type: "row",
      },
      {
        datasource: {
          type: "prometheus",
          uid: "hevy-mcp-vm-90d",
        },
        description:
          "Unique hashed users with any traced Hevy span in the last 24 hours. This intentionally differs from users who invoked an MCP tool.",
        fieldConfig: {
          defaults: {
            decimals: 0,
            unit: "short",
          },
          overrides: [],
        },
        gridPos: {
          h: 4,
          w: 6,
          x: 0,
          y: 1,
        },
        id: 2,
        options: {
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
        },
        targets: [
          {
            editorMode: "code",
            expr: 'count(\n  sum by (user_hash) (\n    increase(mcp_user_activity_total{service="hevy-mcp",user_hash!="",activity_kind=~"tool|resource|prompt"}[1d])\n  ) > 0\n)',
            instant: true,
            legendFormat: "users",
            range: false,
            refId: "A",
          },
        ],
        title: "Active traced hashes (24h, any span)",
        type: "stat",
      },
      {
        datasource: {
          type: "prometheus",
          uid: "hevy-mcp-vm-90d",
        },
        fieldConfig: {
          defaults: {
            decimals: 0,
            unit: "short",
          },
          overrides: [],
        },
        gridPos: {
          h: 4,
          w: 6,
          x: 6,
          y: 1,
        },
        id: 3,
        options: {
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
        },
        targets: [
          {
            editorMode: "code",
            expr: 'sum(increase(mcp_tool_invocations_total{service_name="hevy-mcp"}[$__range]))',
            instant: true,
            legendFormat: "tool calls",
            range: false,
            refId: "A",
          },
        ],
        title: "MCP tool calls (selected range)",
        type: "stat",
      },
      {
        datasource: {
          type: "prometheus",
          uid: "hevy-mcp-vm-90d",
        },
        fieldConfig: {
          defaults: {
            decimals: 2,
            max: 100,
            min: 0,
            unit: "percent",
          },
          overrides: [],
        },
        gridPos: {
          h: 4,
          w: 6,
          x: 12,
          y: 1,
        },
        id: 4,
        options: {
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
        },
        targets: [
          {
            editorMode: "code",
            expr: '100 * sum(increase(mcp_tool_errors_total{service_name="hevy-mcp"}[$__range])) / clamp_min(sum(increase(mcp_tool_invocations_total{service_name="hevy-mcp"}[$__range])), 1)',
            instant: true,
            legendFormat: "error rate",
            range: false,
            refId: "A",
          },
        ],
        title: "MCP tool error rate",
        type: "stat",
      },
      {
        datasource: {
          type: "prometheus",
          uid: "hevy-mcp-vm-90d",
        },
        fieldConfig: {
          defaults: {
            decimals: 0,
            unit: "short",
          },
          overrides: [],
        },
        gridPos: {
          h: 4,
          w: 6,
          x: 18,
          y: 1,
        },
        id: 5,
        options: {
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
        },
        targets: [
          {
            editorMode: "code",
            expr: 'sum(increase(hevy_api_calls_total{service_name="hevy-mcp"}[$__range]))',
            instant: true,
            legendFormat: "API calls",
            range: false,
            refId: "A",
          },
        ],
        title: "Hevy API calls (selected range)",
        type: "stat",
      },
      {
        datasource: {
          type: "prometheus",
          uid: "hevy-mcp-vm-90d",
        },
        fieldConfig: {
          defaults: {
            unit: "short",
          },
          overrides: [],
        },
        gridPos: {
          h: 8,
          w: 12,
          x: 0,
          y: 5,
        },
        id: 6,
        options: {
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
        },
        targets: [
          {
            editorMode: "code",
            expr: 'count(\n  sum by (user_hash) (\n    increase(mcp_user_activity_total{service="hevy-mcp",user_hash!="",activity_kind=~"tool|resource|prompt"}[1d])\n  ) > 0\n)',
            legendFormat: "24h",
            range: true,
            refId: "A",
          },
          {
            editorMode: "code",
            expr: 'count(\n  sum by (user_hash) (\n    increase(mcp_user_activity_total{service="hevy-mcp",user_hash!="",activity_kind=~"tool|resource|prompt"}[7d])\n  ) > 0\n)',
            legendFormat: "7d",
            range: true,
            refId: "B",
          },
          {
            editorMode: "code",
            expr: 'count(\n  sum by (user_hash) (\n    increase(mcp_user_activity_total{service="hevy-mcp",user_hash!="",activity_kind=~"tool|resource|prompt"}[30d])\n  ) > 0\n)',
            legendFormat: "30d",
            range: true,
            refId: "C",
          },
        ],
        title: "Active users by rolling window (tool/resource/prompt activity)",
        type: "timeseries",
      },
      {
        datasource: {
          type: "prometheus",
          uid: "hevy-mcp-vm-90d",
        },
        fieldConfig: {
          defaults: {
            unit: "ops",
          },
          overrides: [],
        },
        gridPos: {
          h: 8,
          w: 12,
          x: 12,
          y: 5,
        },
        id: 7,
        options: {
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
        },
        targets: [
          {
            editorMode: "code",
            expr: 'sum(rate(mcp_tool_invocations_total{service_name="hevy-mcp"}[$__rate_interval]))',
            legendFormat: "tool calls/s",
            range: true,
            refId: "A",
          },
          {
            editorMode: "code",
            expr: 'sum(rate(mcp_tool_errors_total{service_name="hevy-mcp"}[$__rate_interval]))',
            legendFormat: "tool errors/s",
            range: true,
            refId: "B",
          },
          {
            editorMode: "code",
            expr: 'sum(rate(hevy_api_calls_total{service_name="hevy-mcp"}[$__rate_interval]))',
            legendFormat: "API calls/s",
            range: true,
            refId: "C",
          },
        ],
        title: "Request rates",
        type: "timeseries",
      },
      {
        collapsed: false,
        gridPos: {
          h: 1,
          w: 24,
          x: 0,
          y: 13,
        },
        id: 8,
        panels: [],
        title: "Bottlenecks and failures",
        type: "row",
      },
      {
        datasource: {
          type: "prometheus",
          uid: "hevy-mcp-vm-90d",
        },
        fieldConfig: {
          defaults: {
            unit: "ms",
          },
          overrides: [],
        },
        gridPos: {
          h: 8,
          w: 12,
          x: 0,
          y: 14,
        },
        id: 9,
        options: {
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
        },
        targets: [
          {
            editorMode: "code",
            expr: 'histogram_quantile(0.95, sum by (le, tool_name) (rate(mcp_tool_duration_ms_milliseconds_bucket{service_name="hevy-mcp"}[$__rate_interval])))',
            legendFormat: "{{tool_name}}",
            range: true,
            refId: "A",
          },
        ],
        title: "p95 MCP tool latency",
        type: "timeseries",
      },
      {
        datasource: {
          type: "prometheus",
          uid: "hevy-mcp-vm-90d",
        },
        fieldConfig: {
          defaults: {
            unit: "ms",
          },
          overrides: [],
        },
        gridPos: {
          h: 8,
          w: 12,
          x: 12,
          y: 14,
        },
        id: 10,
        options: {
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
        },
        targets: [
          {
            editorMode: "code",
            expr: 'histogram_quantile(0.95, sum by (le, endpoint) (rate(hevy_api_duration_ms_milliseconds_bucket{service_name="hevy-mcp"}[$__rate_interval])))',
            legendFormat: "{{endpoint}}",
            range: true,
            refId: "A",
          },
        ],
        title: "p95 Hevy API latency",
        type: "timeseries",
      },
      {
        datasource: {
          type: "prometheus",
          uid: "hevy-mcp-vm-90d",
        },
        fieldConfig: {
          defaults: {
            unit: "short",
          },
          overrides: [],
        },
        gridPos: {
          h: 8,
          w: 8,
          x: 0,
          y: 22,
        },
        id: 11,
        options: {
          footer: {
            enablePagination: true,
            fields: "",
            reducer: ["sum"],
            show: false,
          },
          showHeader: true,
        },
        targets: [
          {
            editorMode: "code",
            expr: 'topk(15, sum by (tool_name) (increase(mcp_tool_invocations_total{service_name="hevy-mcp"}[$__range])))',
            format: "table",
            instant: true,
            legendFormat: "{{tool_name}}",
            range: false,
            refId: "A",
          },
        ],
        title: "Most-used MCP tools",
        type: "table",
      },
      {
        datasource: {
          type: "prometheus",
          uid: "hevy-mcp-vm-90d",
        },
        fieldConfig: {
          defaults: {
            unit: "short",
          },
          overrides: [],
        },
        gridPos: {
          h: 8,
          w: 8,
          x: 8,
          y: 22,
        },
        id: 12,
        options: {
          footer: {
            enablePagination: true,
            fields: "",
            reducer: ["sum"],
            show: false,
          },
          showHeader: true,
        },
        targets: [
          {
            editorMode: "code",
            expr: 'topk(15, sum by (endpoint, status_code) (increase(hevy_api_calls_total{service_name="hevy-mcp",status_code=~"4..|5.."}[$__range])))',
            format: "table",
            instant: true,
            legendFormat: "{{endpoint}} {{status_code}}",
            range: false,
            refId: "A",
          },
        ],
        title: "Failing API endpoints",
        type: "table",
      },
      {
        datasource: {
          type: "tempo",
          uid: "efs98nkvn6txcf",
        },
        fieldConfig: {
          defaults: {},
          overrides: [],
        },
        gridPos: {
          h: 8,
          w: 8,
          x: 16,
          y: 22,
        },
        id: 13,
        options: {
          footer: {
            enablePagination: true,
            fields: "",
            reducer: ["sum"],
            show: false,
          },
          showHeader: true,
        },
        targets: [
          {
            datasource: {
              type: "tempo",
              uid: "efs98nkvn6txcf",
            },
            limit: 20,
            query:
              '{ resource.service.name = "hevy-mcp" && span.mcp.tool.name != nil && status = error } | count_over_time() by (span.mcp.tool.name)',
            queryType: "traceql",
            refId: "A",
          },
        ],
        title: "Tool errors from traces",
        type: "table",
      },
      {
        collapsed: false,
        gridPos: {
          h: 1,
          w: 24,
          x: 0,
          y: 30,
        },
        id: 14,
        panels: [],
        title: "Service versions",
        type: "row",
      },
      {
        datasource: {
          type: "prometheus",
          uid: "hevy-mcp-vm-90d",
        },
        description: "Tool-call activity grouped by emitted service.version.",
        fieldConfig: {
          defaults: {
            unit: "short",
          },
          overrides: [],
        },
        gridPos: {
          h: 8,
          w: 10,
          x: 0,
          y: 31,
        },
        id: 15,
        options: {
          footer: {
            enablePagination: true,
            fields: "",
            reducer: ["sum"],
            show: false,
          },
          showHeader: true,
        },
        targets: [
          {
            editorMode: "code",
            expr: 'sort_desc(sum by (service_version) (increase(mcp_tool_invocations_total{service_name="hevy-mcp",service_version!=""}[$__range])))',
            format: "table",
            instant: true,
            legendFormat: "{{service_version}}",
            range: false,
            refId: "A",
          },
        ],
        title: "Service version usage",
        type: "table",
      },
      {
        datasource: {
          type: "prometheus",
          uid: "hevy-mcp-vm-90d",
        },
        description:
          "Per-version MCP tool call rate. Older versions remain visible for the selected retention window.",
        fieldConfig: {
          defaults: {
            unit: "ops",
          },
          overrides: [],
        },
        gridPos: {
          h: 8,
          w: 14,
          x: 10,
          y: 31,
        },
        id: 16,
        options: {
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
        },
        targets: [
          {
            editorMode: "code",
            expr: 'sum by (service_version) (rate(mcp_tool_invocations_total{service_name="hevy-mcp",service_version!=""}[$__rate_interval]))',
            legendFormat: "{{service_version}}",
            range: true,
            refId: "A",
          },
        ],
        title: "Service version activity over time",
        type: "timeseries",
      },
      {
        collapsed: false,
        gridPos: {
          h: 1,
          w: 24,
          x: 0,
          y: 39,
        },
        id: 17,
        panels: [],
        title: "Trace drill-down",
        type: "row",
      },
      {
        datasource: {
          type: "tempo",
          uid: "efs98nkvn6txcf",
        },
        fieldConfig: {
          defaults: {},
          overrides: [],
        },
        gridPos: {
          h: 9,
          w: 24,
          x: 0,
          y: 40,
        },
        id: 18,
        options: {
          footer: {
            enablePagination: true,
            fields: "",
            reducer: ["sum"],
            show: false,
          },
          showHeader: true,
        },
        targets: [
          {
            datasource: {
              type: "tempo",
              uid: "efs98nkvn6txcf",
            },
            limit: 50,
            query: '{ resource.service.name = "hevy-mcp" && span.mcp.tool.name != nil }',
            queryType: "traceql",
            refId: "A",
          },
        ],
        title: "Recent MCP tool spans",
        type: "table",
      },
      {
        collapsed: false,
        gridPos: {
          h: 1,
          w: 24,
          x: 0,
          y: 49,
        },
        id: 19,
        panels: [],
        title: "Telemetry cost and cardinality",
        type: "row",
      },
      {
        datasource: {
          type: "prometheus",
          uid: "hevy-mcp-vm-90d",
        },
        description:
          "Number of retained metric samples in the selected range. This counts stored sample rows, not logical requests or events.",
        fieldConfig: {
          defaults: {
            decimals: 0,
            unit: "short",
          },
          overrides: [],
        },
        gridPos: {
          h: 6,
          w: 8,
          x: 0,
          y: 50,
        },
        id: 20,
        options: {
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
        },
        targets: [
          {
            editorMode: "code",
            expr: 'sum(count_over_time({service_name="hevy-mcp"}[$__range]))',
            instant: true,
            legendFormat: "metric samples",
            range: false,
            refId: "A",
          },
        ],
        title: "Native metric sample rows",
        type: "stat",
      },
      {
        datasource: {
          type: "prometheus",
          uid: "hevy-mcp-vm-90d",
        },
        description:
          "Current number of native Hevy metric series. Histograms contribute one series per bucket and label set.",
        fieldConfig: {
          defaults: {
            decimals: 0,
            unit: "short",
          },
          overrides: [],
        },
        gridPos: {
          h: 6,
          w: 8,
          x: 8,
          y: 50,
        },
        id: 21,
        options: {
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
        },
        targets: [
          {
            editorMode: "code",
            expr: 'count({service_name="hevy-mcp"})',
            instant: true,
            legendFormat: "active series",
            range: false,
            refId: "A",
          },
        ],
        title: "Active traced series (any span)",
        type: "stat",
      },
      {
        datasource: {
          type: "prometheus",
          uid: "hevy-mcp-vm-90d",
        },
        description:
          "Share of selected-range native metric samples emitted by latency histogram buckets. A high value indicates storage is dominated by histogram bucket rows rather than logical event counters.",
        fieldConfig: {
          defaults: {
            decimals: 2,
            max: 100,
            min: 0,
            unit: "percent",
          },
          overrides: [],
        },
        gridPos: {
          h: 6,
          w: 8,
          x: 16,
          y: 50,
        },
        id: 22,
        options: {
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
        },
        targets: [
          {
            editorMode: "code",
            expr: '100 * sum(count_over_time({__name__=~"mcp_tool_duration_ms_milliseconds_bucket|hevy_api_duration_ms_milliseconds_bucket",service_name="hevy-mcp"}[$__range])) / clamp_min(sum(count_over_time({service_name="hevy-mcp"}[$__range])), 1)',
            instant: true,
            legendFormat: "histogram bucket share",
            range: false,
            refId: "A",
          },
        ],
        title: "Histogram sample share",
        type: "stat",
      },
    ],
    refresh: "1m",
    schemaVersion: 42,
    tags: ["hevy-mcp", "tempo", "victoriametrics", "90d"],
    templating: {
      list: [],
    },
    time: {
      from: "now-24h",
      to: "now",
    },
    timepicker: {},
    timezone: "browser",
    title: "Hevy MCP — Tempo + VictoriaMetrics (90d)",
    uid: "hevy-mcp-tempo-vm-90d",
    version: 1,
    weekStart: "monday",
  } as const;
}
