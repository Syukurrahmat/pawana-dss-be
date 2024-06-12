import DataLogs from "../models/datalogs.ts";
import EventLogs from "../models/eventLogs.ts";
import Reports from "../models/reports.ts";

type Timeseries<V = number> = { datetime: Date, value: V }

type ISPUValue = {
    pollutant: 'PM100' | 'PM25';
    ispu: number;
    ispuFloat: number;
    pollutantValue: number;
    category: string;
    recomendation?: string
}


type GRKCategorize = {
    gas: "CH4" | "CO2";
    value: number;
    category: string;
    recomendation?: string
}

// ===========================================================

declare type ResultOfMappingNode = {
    nodeId: number;
    companyId: any;
    name: string;
    status: string;
    lastDataSent: Date
    coordinate: number[];
    dataLogs?: DataLogs[],


    latestData?: {
        ispu: {
            datetime: Date;
            value: [] | [ISPUValue, ISPUValue];
        };
        ch4: {
            datetime: Date;
            value: GRKCategorize;
        };
        co2: {
            datetime: Date;
            value: GRKCategorize;
        };
        pm25: {
            datetime: Date;
            value: number;
        };
        pm100: {
            datetime: Date;
            value: number;
        };
    }
}



// ==============================================================


type SingleNodeAnalysis = {
    node: {
        name: string,
        nodeId: number,
        lastDataSent: Date;
    }

    ispu: SingleNodeAnalysisItem<ISPUValue[]>
    ch4: SingleNodeAnalysisItem<GRKCategorize>;
    co2: SingleNodeAnalysisItem<GRKCategorize>;

}

type SingleNodeAnalysisItem<V> = {
    latestData: {
        datetime: Date;
        value: V;
    }
    tren: {
        datetime: Date;
        value: V;
    }[];
}


//  ===============================


type ResultOfMultiNodeStats = {
    ispu: NodeStat<ISPUValue[]>;
    ch4: NodeStat<GRKCategorize>;
    co2: NodeStat<GRKCategorize>;
};

type NodeStat<T> = {
    average: {
        data: {
            datetime: Date;
            value: T
        }
    };
    highest: {
        nodeId: number;
        name: string;
        lastDataSent: Date;
        data: {
            datetime: Date;
            value: T
        }
    };
    lowest: {
        nodeId: number;
        name: string;
        lastDataSent: Date;
        data: {
            datetime: Date;
            value: T
        }
    };

    list: {
        nodeId: number;
        name: string;
        lastDataSent: Date;
        data: {
            datetime: Date;
            value: T
        }
    }[]
};


// ====================================================================

declare type DashboardDataType = {
    dashboardInfo: {
        name: string;
        type: string;
        countNodes: number

        companyId?: number;
        managedBy?: number;
        createdAt?: string;
    };
    indoor: {
        countNodes: DetailCountNodes;
        data: SingleNodeAnalysis | ResultOfMultiNodeStats | null;
    };
    outdoor: {
        countNodes: DetailCountNodes;
        data: SingleNodeAnalysis | ResultOfMultiNodeStats | null;
    };
    nodes: ResultOfMappingNode[];
    currentEventLogs: EventLogs[];
    nearReports: Reports[]
}

type DetailCountNodes = {
    all: number;
    active: number;
}
