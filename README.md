# Link2Home Zigbee TRV (TS0601, _TZE200_7ww4sfzm)

A minimal Zigbee2MQTT external converter for the Link2Home thermostatic radiator valve identified as:

- **Zigbee model:** `TS0601`
- **Manufacturer fingerprint:** `_TZE200_7ww4sfzm`
- **Reported device endpoints:** endpoint 1 with `genBasic`, `genGroups`, `genScenes`, and `manuSpecificTuya` as input clusters; `genOta` and `genTime` as output clusters.

This repository records hands-on findings and a minimal converter. It is not an official Link2Home or Zigbee2MQTT release.

## Current support

The converter exposes a Home Assistant climate entity with:

- Current setpoint (read/write, 5–30 °C, 1 °C steps)
- Device-reported local temperature (read-only)

### Datapoints observed

| Tuya DP | Converter property | Interpretation | Confidence / notes |
|---:|---|---|---|
| 103 | `current_heating_setpoint` | Target setpoint, scaled by 10 | **Confirmed.** Physical dial values and Home Assistant setpoint writes matched raw reports: e.g. 19 °C produced DP 103 raw value 190; 30 °C produced 300. |
| 102 | `local_temperature` | Temperature reading, likely scaled by 10 | **Strong evidence, units not independently verified.** The raw value rose while the TRV was warmed and fell as it cooled. Dividing by ten produced plausible Celsius values, but no independent thermometer was available to verify accuracy or scale. |

The mapping uses `tuya.valueConverter.divideBy10` for both values. DP 103's scaling was verified through the physical dial and a Home Assistant setpoint command. DP 102 behaves like a temperature sensor, but treat the resulting local temperature as provisional until compared with a reliable reference thermometer after the device has equilibrated.

## External converter

The standalone converter is in [`link2home-trv.mjs`](./link2home-trv.mjs).

It deliberately exposes only the two datapoints supported by observations. It does **not** add guessed controls for battery, valve position, child lock, schedule, away mode, frost protection, or window detection.

### Installation

1. Copy `link2home-trv.mjs` into the external-converters directory used by your Zigbee2MQTT installation.
2. Ensure external JavaScript converters are enabled in your Zigbee2MQTT configuration.
3. Restart Zigbee2MQTT and check the logs for `Loaded external converter 'link2home-trv.mjs'`.
4. Check that the device is identified by the exact fingerprint above, then confirm setpoint control and temperature reporting before relying on it.

External-converter paths and configuration details can vary by installation and Zigbee2MQTT version. See the [Zigbee2MQTT external converter documentation](https://www.zigbee2mqtt.io/advanced/more/external_converters.html).

## Investigation notes and limitations

- Two physical TRVs with this fingerprint paired to one Zigbee2MQTT network and exposed the setpoint successfully with this minimal mapping.
- Setpoint writes produced DP 103 reports with values scaled by ten.
- DP 102 was reported repeatedly and tracked warming/cooling behaviour. Its exact scale and room-temperature accuracy still need independent validation.
- Enabling a one-minute generic Tuya `dataQuery` interval did not give a reliable full state report and caused repeated `MAC_TRANSACTION_EXPIRED` errors for one device. This polling configuration is intentionally **not** part of the converter.
- During query experiments, additional raw responses were seen for DPs 110, 115, and 119. Their meanings are unknown; no mappings are claimed for them.
- Diagnostic mappings for other datapoints were not reliable evidence of their meaning. Values shown by a diagnostic entity were not assumed to be valid unless corroborated by actual raw Tuya reports and a controlled test.
- Other TS0601/Saswell-family TRVs may use different datapoint maps. Do not assume candidate datapoints from other models apply to this fingerprint.


## Related supported variant: TS0601_wsek35um

A related Tuya radiator thermostat is documented in Zigbee2MQTT as [`TS0601_wsek35um`](https://www.zigbee2mqtt.io/devices/TS0601_wsek35um.html). Its upstream converter was added in [zigbee-herdsman-converters PR #13227](https://github.com/Koenkk/zigbee-herdsman-converters/pull/13227).

**Do not assume it is the same firmware or use its datapoint map unchanged.** The upstream definition identifies the other device as `TS0601` / `_TZE204_wsek35um`; this repository's Link2Home device identifies as `TS0601` / `_TZE200_7ww4sfzm`. The suffixes and full manufacturer fingerprints differ, and the two observed datapoint maps are not the same.

The upstream `TS0601_wsek35um` definition documents:

| DP | Meaning on that variant |
|---:|---|
| 2 | Mode: `Off`, `Cold`, `Night`, `Day`, `Scheduled` |
| 4 | Target setpoint, divided by 10 |
| 5 | Local temperature, divided by 10 |
| 7 | Children-lock status |

For the Link2Home fingerprint documented here, current captured evidence instead confirms DP 103 for target setpoint and suggests DP 102 for local temperature. The lock and schedule experiments performed here did not capture a corresponding raw mode/lock datapoint, so DP 2 and DP 7 are **unverified hypotheses only** for the Link2Home model. Switching schedule modes coincided with a target changing from 19 °C to 16 °C, which is consistent with a programmed target being applied, but the mode datapoint itself was not captured. This behavioural similarity is worth investigating; it is not proof that the two models are identical.

## Related reports

Earlier incomplete support reports for this fingerprint:

- [zigbee-herdsman-converters issue #10317](https://github.com/Koenkk/zigbee-herdsman-converters/issues/10317)
- [Zigbee2MQTT issue #29035](https://github.com/Koenkk/zigbee2mqtt/issues/29035)
- [ZHA device support request #5384](https://github.com/zigpy/zha-device-handlers/issues/5384)

This repository adds a tested minimal converter and records which conclusions are verified versus still tentative. Contributions that include raw datapoint logs, firmware details, and controlled tests are welcome. Please redact IEEE addresses, network identifiers, local IP addresses, room names, and other household-specific details from logs before posting them publicly.
