# Dashboard Panel Patterns

This document describes the standardized panel patterns used across all dashboards.

## Two-Panel Metric Pattern

The primary pattern used for displaying time-series metrics with current status.

### Layout

```
┌─────────────────────────────────────┬───────────┐
│  Timeseries Panel (18×8)            │Stat Panel │
│  - Current + Previous 24h overlay   │ (6×8)     │
│  - Dashed grey line for previous    │ Current   │
│  - Trend visualization              │ Value     │
└─────────────────────────────────────┴───────────┘
```

### Configuration

Each panel pair takes up exactly 24 grid units (1 full row width):
- **Timeseries**: `x: 0, w: 18, h: 8` (left side, wide)
- **Stat**: `x: 18, w: 6, h: 8` (right side, compact)

### Features

✅ **Null Value Connection**
- Threshold: 600,000 milliseconds (10 minutes)
- Applied via `build.ts` automatically
- Bridges gaps from network outages or brief service interruptions
- Implemented twice:
  - `fieldConfig.defaults.custom.spanNulls: 600000`
  - `options.connect.threshold: 600000`

✅ **Previous 24h Overlay**
- Uses PromQL `offset 24h` for historical data
- Styled with dashed line: `dash: [10, 10]`
- Color: Fixed grey `#555555` for easy distinction
- Helps identify trends and compare with previous day

✅ **Consistent Styling**
- Line width: 2px
- Fill opacity: 10% (subtle background fill)
- Show points: "never" (clean lines without dots)
- Fill mode: Fill entire area under curve

### Example Usage

```typescript
// Timeseries with previous 24h
const currentQuery = new DataqueryBuilder()
  .refId("A")
  .expr('{__name__="sensor.temperature_value"}')
  .datasource(victoriaMetricsDS)
  .legendFormat("Current");

const previousQuery = new DataqueryBuilder()
  .refId("B")
  .expr('{__name__="sensor.temperature_value"} offset 24h')
  .datasource(victoriaMetricsDS)
  .legendFormat("Previous 24h");

const timeseriesPanel = new TimeseriesPanelBuilder()
  .title("Temperature")
  .datasource(victoriaMetricsDS)
  .withTarget(currentQuery)
  .withTarget(previousQuery)
  .gridPos({ x: 0, y: 0, w: 18, h: 8 })
  .unit("celsius")
  .min(0)
  .lineWidth(2)
  .fillOpacity(10)
  .showPoints("never")
  .overrideByName("Previous 24h", [
    { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
    { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
  ]);

// Stat panel for current value
const statQuery = new DataqueryBuilder()
  .refId("A")
  .expr('{__name__="sensor.temperature_value"}')
  .datasource(victoriaMetricsDS);

const statPanel = new StatPanelBuilder()
  .title("Temperature")
  .datasource(victoriaMetricsDS)
  .withTarget(statQuery)
  .gridPos({ x: 18, y: 0, w: 6, h: 8 })
  .unit("celsius")
  .graphMode("area");
```

## Alternative Patterns

### Single Panel (Timeseries Only)
- Used when trend visualization is primary
- Width: 24 (full row)
- Example: Location tracking history panels

### Multi-Panel Layouts
- **Thermostat**: Zone-based rows (3 panels per zone)
- **Location**: Map + stat panels for spatial data

### Statistical Panels
- Used for standalone metrics without time-series
- Examples: Current battery level, HVAC action, GPS coordinates

## Grid Position Management

All dashboards use a 24-unit grid width (standard Grafana):

```
Width units:
- Full row: 24
- Two-panel metric: 18 (timeseries) + 6 (stat)
- Thirds: 8 + 8 + 8
- Quarters: 6 + 6 + 6 + 6
- Half: 12 + 12

Height units (typically):
- Metric panels: 8
- Summary stats: 4
- Maps: 10+
```

## Units & Formatting

Common units used:

| Metric | Unit | Description |
|--------|------|-------------|
| Temperature | `celsius`, `fahrenheit` | Degrees |
| Humidity | `percent` | 0-100% |
| Power | `watt`, `kilowatt` | Energy |
| Energy | `kwatth` | Kilowatt-hours |
| Concentration | `conμgm3` | µg/m³ (micrograms) |
| CO₂ | `ppm` | Parts per million |
| GPS | `degrees` | Latitude/longitude |
| Battery | `percent` | 0-100% |
| Speed | `mps` | Meters per second |
| Distance | `meters` | Length |

## Threshold Coloring

Thresholds provide visual alerts:

```typescript
.thresholds({
  mode: "absolute",
  steps: [
    { color: "green", value: 0 },
    { color: "red", value: 80 },
  ]
})
```

Used for:
- Air Quality indices (VOC, NOx)
- Humidity (comfort ranges)
- Battery levels (critical thresholds)
- Power consumption alerts

## Helper Functions

See `src/shared/panel-builder.ts` for reusable functions:

- `createMetricPanels()` - Create two-panel metric layout
- Automatically applies null value bridging
- Handles previous 24h overlay styling
- Consistent formatting across dashboards

## Best Practices

1. **Always use two-panel layout** for trending metrics
2. **Enable null value connection** (handled by build.ts)
3. **Include previous 24h** for comparison context
4. **Use consistent colors** (grey #555555 for overlay)
5. **Set appropriate min/max** for visual scaling
6. **Label clearly** - title should describe the metric
7. **Position logically** - group related metrics
8. **Test locally** before deploying via GitHub Actions
