export interface PSettings {
    default_room_id: number;
    data_dir: string;
    port: number;
    log_level: number;
    log_line_length: number;
    server_start_date: {
        day: number;
        month: number;
        year: number;
    };
}

interface CalcSettings {
    server_start_date_ms: number;
}

export class PanoptykSettings {
    static default = Object.freeze({
        default_room_id: 1,
        data_dir: "data",
        port: 8080,
        log_level: 2,
        log_line_length: 99,
        server_start_date: {
            day: 1,
            month: 1,
            year: 1970,
        },
    });

    _settings: PSettings & CalcSettings;
    get settings() {
        return this._settings;
    }

    constructor(settings?: PSettings) {
        this._settings = Object.assign({}, PanoptykSettings.default) as any;
        this._settings.server_start_date = Object.assign(
            {},
            PanoptykSettings.default.server_start_date
        );
        this.setSettings(settings);
    }

    setSettings(settings?: PSettings) {
        if (settings instanceof Object) {
            for (const key in PanoptykSettings.default) {
                if (settings[key] !== undefined) {
                    this._settings[key] = settings[key];
                }
            }
        }
        this._calcSettings();
    }

    _calcSettings() {
        // UTC(ms) offset
        this._settings.server_start_date_ms = Math.max(
            0,
            Date.UTC(
                this._settings.server_start_date.year,
                this._settings.server_start_date.month - 1, // Month is on a 0 to 11 scale
                this._settings.server_start_date.day
            )
        );
    }
}
