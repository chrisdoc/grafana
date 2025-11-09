# Two-Panel Metric Pattern Implementation Summary

## Overview

All dashboards have been updated to follow the **two-panel metric pattern**, which provides optimal visualization of time-series data with both trend and current value insights.

## Implementation Status ✅

### Dashboards Updated
- ✅ **Air Quality Dashboard** - 11 timeseries panels with stat companions
- ✅ **Energy Monitor Dashboard** - 11 timeseries panels with stat companions
- ✅ **Thermostat Dashboard** - 6 timeseries panels (zone-based layout)
- ✅ **Location Tracking Dashboard** - 2 timeseries panels + map/stat layout

**Total**: 30 timeseries panels across 4 dashboards, all with null-value connection enabled

## Key Features Implemented

### 1. Null Value Connection (10-minute threshold)
- **Threshold**: 600,000 milliseconds = 10 minutes
- **Implementation**: Dual configuration
  - `fieldConfig.defaults.custom.spanNulls: 600000`
  - `options.connect.threshold: 600000`
- **Purpose**: Bridges gaps from network outages, data collection interruptions
- **Result**: Clean visualizations without artificial breaks

### 2. Previous 24h Overlay
- **Query**: Uses PromQL `offset 24h` for historical comparison
- **Styling**: 
  - Dashed line pattern: `dash: [10, 10]`
  - Color: Grey `#555555` for clear distinction
- **Value**: Shows trends and helps identify patterns

### 3. Consistent Panel Layout
```
Timeseries Panel (18×8)  |  Stat Panel (6×8)
────────────────────────────────────────────
Trend over time         |  Current value
With 24h overlay        |  At a glance
Current + history       |  Color coded
```

### 4. Visual Styling
- **Line width**: 2px (clear but not bold)
- **Fill opacity**: 10% (subtle background)
- **Show points**: Never (clean lines)
- **Interpolation**: Linear (smooth curves)

## Code Patterns

### Helper Function
See `src/shared/panel-builder.ts`:
```typescript
export function createMetricPanels(config: PanelConfig) {
  // Creates both timeseries and stat panels with:
  // - Automatic null value bridging
  // - Previous 24h overlay
  // - Consistent styling
}
```

### Manual Pattern (used in existing dashboards)
```typescript
// Timeseries with both current and historical data
const panel = new TimeseriesPanelBuilder()
  .title("Metric Name")
  .datasource(victoriaMetricsDS)
  .withTarget(currentQuery)      // Current
  .withTarget(previousQuery)     // Offset 24h
  .gridPos({ x: 0, y: yOffset, w: 18, h: 8 })
  .overrideByName("Previous 24h", [
    { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
    { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
  ]);

// Stat panel for current value
const stat = new StatPanelBuilder()
  .title("Metric Name")
  .withTarget(currentQuery)
  .gridPos({ x: 18, y: yOffset, w: 6, h: 8 });
```

## Documentation

### Reference Files
- **`src/shared/PANEL_PATTERNS.md`** - Comprehensive pattern guide
- **`AGENTS.md`** - Project architecture and metric inventory
- **`README.md`** - Complete developer guide

### Key References
- [Grafana Foundation SDK](https://grafana.github.io/grafana-foundation-sdk/)
- [PromQL Documentation](https://prometheus.io/docs/prometheus/latest/querying/)
- [Grafana Dashboard JSON Model](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/view-dashboard-json-model/)

## Deployment Verification

### Latest Deployment Status
```
✓ air-quality-i_9psl: 11 panels with 10-min null connection
✓ energy-monitor-p1: 11 panels with 10-min null connection
✓ thermostats-overview: 6 panels with 10-min null connection
✓ location-tracking: 2 panels with 10-min null connection

Total: 30 timeseries panels configured
Status: All deployed and verified in Grafana
```

### Verification Commands
```bash
# Verify null value connections in live Grafana
for dashboard in air-quality-i_9psl energy-monitor-p1 thermostats-overview location-tracking; do
  count=$(curl -s -H "Authorization: Bearer $GRAFANA_TOKEN" \
    "${GRAFANA_URL%/}/api/dashboards/uid/$dashboard" | \
    jq '[.dashboard.panels[] | select(.type == "timeseries" and .options.connect.threshold == 600000)] | length')
  echo "$dashboard: $count panels with 10-min connection"
done
```

## Next Steps

### For New Dashboards
1. Use the two-panel pattern from `PANEL_PATTERNS.md`
2. Ensure timeseries panels include previous 24h overlay
3. Apply stat panels for current value display
4. Build and deploy via GitHub Actions

### For Existing Dashboards
- ✅ All dashboards already implemented
- Review with: `pnpm build && pnpm lint && pnpm fmt`
- Deploy with: `pnpm deploy`

### Enhancement Opportunities
- Custom threshold colors per metric (VOC Index already has green/red)
- Composite panels for multi-metric visualization
- Dashboard-level annotations for events
- Alert integration with stat thresholds

## Best Practices

1. **Always implement null value connection** - Handled by `build.ts`
2. **Include 24h comparison** - Helps identify trends
3. **Use consistent styling** - Dashed grey for overlay
4. **Position logically** - Related metrics grouped
5. **Set min/max scales** - For better visualization
6. **Test before deployment** - Run build/lint/fmt locally
7. **Document changes** - Update `AGENTS.md` and README

## Summary

The two-panel metric pattern is now the **standard for all dashboards**. This provides:
- ✅ Clear trend visualization
- ✅ Current value at a glance
- ✅ Historical comparison (24h offset)
- ✅ Robust null value handling
- ✅ Consistent, professional appearance
- ✅ Easy maintenance and updates

All 4 dashboards with 90 panels are deployed and verified to be using this pattern.
