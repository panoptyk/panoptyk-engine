import { MemoryDatabase } from "../database/MemoryDatabase";
import { IDatabase } from "../database/IDatabase";
import { PanoptykSettings } from "./panoptykSettings";

/**
 * Insertion point for D.I. classes
 *  that are generally globally accessable
 */
class AppContext {
    //#region Singleton
    static _instance: AppContext;
    static get instance(): AppContext {
        if (!AppContext._instance) {
            AppContext._instance = new AppContext();
        }
        return AppContext._instance;
    }
    private constructor() {
        this.settingsManager = new PanoptykSettings();
    }
    //#endregion

    //#region Properties
    db: IDatabase;
    settingsManager: PanoptykSettings;
    initialized = false;
    //#endregion

    defaultInitialize() {
        this.db = new MemoryDatabase();
        this.initialized = true;
    }

    initialize(db: IDatabase) {
        this.db = db;
    }
}

export default AppContext.instance;
