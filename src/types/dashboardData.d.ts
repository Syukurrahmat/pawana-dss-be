import { Moment } from "moment";
import EventLogs from "../models/eventLogs.ts";
import Nodes from "../models/nodes.ts";
import Reports from "../models/reports.ts";

type Timeseries<V = number> = { datetime: Date, value: V }

type ISPUDetailValue = {
    pollutant: 'PM100' | 'PM25';
    ispu: number;
    ispuFloat: number;
    pollutantValue: number;
    category?: string;
    recomendation?: {
        info: string;
        company: string;
        public: string;
    }
}


type GRKDetailValue = {
    value: number;
    category?: string;
    recomendation?: {
        info: string;
        company: string;
        public: string;
    }
}

// ===========================================================

declare type NodeWithLastestData = Nodes & {
    latestData?: {
        ispu: {
            datetime: Date;
            value: [ISPUDetailValue, ISPUDetailValue] | null;
        };
        ch4: {
            datetime: Date;
            value: GRKDetailValue;
        };
        co2: {
            datetime: Date;
            value: GRKDetailValue;
        };
        pm25: {
            datetime: Date;
            value: number;
        };
        pm100: {
            datetime: Date;
            value: number;
        };
    },

    PMDatalogs?: {
        ispuHour: Moment,
        tren: {
            datetime: Date;
            pm100: number;
            pm25: number;
        }[]
    }
}



// ==============================================================


type SingleNodeAnalysis = {
    node: {
        name: string,
        nodeId: number,
        lastDataSent: Date;
    }

    ispu: SingleNodeAnalysisItem<[ISPUDetailValue, ISPUDetailValue] | null>
    ch4: SingleNodeAnalysisItem<GRKDetailValue>;
    co2: SingleNodeAnalysisItem<GRKDetailValue>;

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

type MultiNodeAnalysis = {
    ispu: NodeStatistic<ISPUDetailValue[]>;
    ch4: NodeStatistic<GRKDetailValue>;
    co2: NodeStatistic<GRKDetailValue>;
};

type NodeStatistic<T> = {
    average: {
        data: Timeseries<T>
    };
    highest: {
        nodeId: number;
        name: string;
        lastDataSent: Date;
        data: Timeseries<T>
    };
    lowest: {
        nodeId: number;
        name: string;
        lastDataSent: Date;
        data: Timeseries<T>
    };
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
    indoor?: NodesGroup;
    outdoor: NodesGroup;
    nodes: {
        indoor?: NodeWithLastestData[],
        outdoor: NodeWithLastestData[]
    };
    currentEventLogs: EventLogs[];
    nearReports: Reports[]
}


type NodesGroup = {
    analiysisDataType: string;
    countNodes: {
        all: number;
        active: number;
    };
    data: SingleNodeAnalysis | MultiNodeAnalysis | null;
}