import * as exposes from "zigbee-herdsman-converters/lib/exposes";
import * as tuya from "zigbee-herdsman-converters/lib/tuya";

const e = exposes.presets;
const ea = exposes.access;

export default {
    fingerprint: [{
        modelID: "TS0601",
        manufacturerName: "_TZE200_7ww4sfzm",
    }],
    model: "Link2Home_TRV",
    vendor: "Link2Home",
    description: "Link2Home Zigbee thermostatic radiator valve",

    extend: [
        tuya.modernExtend.tuyaBase({dp: true}),
    ],

    configure: tuya.configureMagicPacket,
    onEvent: tuya.onEventSetTime,

    exposes: [
        e.climate()
            .withSetpoint("current_heating_setpoint", 5, 30, 1, ea.STATE_SET)
            .withLocalTemperature(ea.STATE),
    ],

    meta: {
        tuyaDatapoints: [
            [102, "local_temperature", tuya.valueConverter.divideBy10],
            [103, "current_heating_setpoint", tuya.valueConverter.divideBy10],
        ],
    },
};
