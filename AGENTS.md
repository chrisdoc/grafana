# Grafana Agent Context

## Quick Summary
- **VictoriaMetrics/Prometheus** (DEFAULT): 2,708 Home Assistant metrics from VictoriaMetrics
- **InfluxDB**: homeassistant and proxmox buckets available
- **Update Frequency**: Real-time to 5-minute intervals
- **Last Updated**: November 9, 2025

## Datasources

| Datasource | Type | URL | UID |
|-----------|------|-----|-----|
| **vic** (PRIMARY) | VictoriaMetrics | `http://192.168.86.213:8428/` | `df3igl5nh1f5sa` |
| homeassistant | InfluxDB (Flux) | `http://**:8086` | `ee572hhislhj4a` |
| proxmox | InfluxDB (Flux) | `http://**:8086` | `edrq0qc5e0c8wb` |

### VictoriaMetrics Labels & Patterns
- **Labels**: `__name__`, `db`, `domain`, `entity_id`, `friendly_name`, `unit_of_measurement`
- **Domains**: binary_sensor, climate, input_select, light, number, sensor, switch, weather
- **Pattern**: `{domain}.{entity_id}_{attribute}` (e.g., `sensor.bathroom_temperature_value`)

---

## Metric Inventory (2,708 Total)

### By Domain
| Domain | Count | Key Metrics |
|--------|-------|------------|
| device_tracker | 1,459 | Location, presence, connectivity |
| sensor | 696 | Power, energy, temperature, humidity, battery |
| binary_sensor | 221 | Motion, occupancy, contact sensors |
| light | 207 | Brightness, color, effects (11 entities) |
| climate | 42 | Temperature, humidity, HVAC state, presets |
| switch | 36 | On/off controls (AdGuard, child locks) |
| weather | 28 | Temperature, wind, precipitation, UV |
| person | 13 | User presence aggregation |
| number | 5 | Numeric inputs |
| input_select | 1 | Selection input |

### Key Entities

**Air Quality** (sensor.i_9psl):
- CO₂, PM0.3/PM1/PM2.5/PM10, NOx, VOC indices, temperature, humidity

**Climate Control** (4 zones):
- bathroom, bedroom, living_room, hot_water
- Metrics: temperature, target_temperature, humidity, hvac_action, preset_mode, window_state

**Power & Energy** (P1 Meter + Devices):
- Real-time power per phase, daily/monthly import, tariff tracking
- Device-level: dining lights, sofa, RGBW bulbs

**Lighting** (11 entities):
- Rooms: bed, dining (3x), floor, living, monitor, sofa (3x), standing
- Attributes: state, brightness, color, hs, rgb, rgbw, xy, effect

**Location & Presence**:
- person.chrisdoc, person.meghan (aggregated)
- device_tracker.chrisphone, device_tracker.meg_2
- 1,459 network device trackers with connectivity data

**Smart Home Devices**:
- AdGuard Home (filtering, blocking stats)
- Air Purifier (filter lifetime, PM2.5)
- Cameras (motion, audio, recording)
- Printer (status, state reason)

---

## Query Examples

```promql
# Current CO₂ level
sensor.i_9psl_carbon_dioxide_value

# PM2.5 over last hour
sensor.i_9psl_pm2_5_value[1h]

# Average temperature (5min windows)
avg_over_time(sensor.i_9psl_temperature_value[5m])

# Filter by domain
{domain="sensor"}

# Filter by entity_id
{entity_id="bathroom_temperature"}

# Group by domain
count by (domain) ({__name__=~".+"})
```

---

## Current Dashboards

| Dashboard | Panels | Key Features |
|-----------|--------|--------------|
| Air Quality | 26 | PM2.5, PM10, CO₂, NOx, VOC, humidity, temp |
| Energy Monitor | 36 | Real-time & historical power, tariffs, cost |
| Thermostat | 18 | Room temps, humidity, HVAC state, presets |
| Location Tracking | 10 | GPS coords, home/away state, history |

---

## Recommended New Dashboards

### Priority 1 (High Value)
1. **Power & Energy Dashboard** ⚡ - Phase breakdown, daily trends, cost analysis
2. **Lighting Control Dashboard** 💡 - Status, brightness, color, power per light
3. **Weather Dashboard** 🌤️ - Conditions, temperature, wind, precipitation, UV

### Priority 2 (Good Data)
4. **Home Occupancy Dashboard** 👥 - Presence, motion, network device status
5. **Security & Access Dashboard** 🔒 - AdGuard stats, camera alerts, network health
6. **Mobile & Wearables Dashboard** 📱 - Battery levels, activity, location
