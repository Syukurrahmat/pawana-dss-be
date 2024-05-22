import { InferAttributes } from "sequelize";
import Nodes from "../models/nodes.ts";

type Timeseries<V = number> = { datetime: Date, value: V }

type ISPUValue = {
    pollutant: 'PM100' | 'PM25';
    ispu: number;
    ispuFloat: number;
    value: number;
    category: string;
}


type GRKCategorize = {
    gas: "CH4" | "CO2";
    value: number;
    category: string;
}

type NodeInfo = {
    name: string, nodeId: number
};


// ===========================================================

declare type ResultOfMappingNode = {
    meta: {
        isIndoor: boolean;
        dataIsUptodate: boolean;
    }
    node: InferAttributes<Nodes, { omit: never; }>
    ispu?: {
        datetime: Date;
        value: ISPUValue[];
    };
    ch4?: {
        datetime: Date;
        value: GRKCategorize;
    };
    co2?: {
        datetime: Date;
        value: GRKCategorize;
    };
    pm25?: {
        datetime: Date;
        value: number;
    };
    pm100?: {
        datetime: Date;
        value: number;
    };
}



// ==============================================================


type SingleNodeAnalysis = {
    ispu: SingleNodeAnalysisItem<ISPUValue[], ISPUValue[]>
    ch4: SingleNodeAnalysisItem<GRKCategorize, number>;
    co2: SingleNodeAnalysisItem<GRKCategorize, number>;
}

type SingleNodeAnalysisItem<V, W> = {
    node: NodeInfo
    current: {
        datetime: Date;
        value: V;
    };
    tren: {
        datetime: Date;
        value: W;
    }[];
}


//  ===============================


type ResultOfMultiNodeStats = {
    ispu: NodeStat<ISPUValue[]>;
    ch4: NodeStat<GRKCategorize>;
    co2: NodeStat<GRKCategorize>;
};

type NodeStat<T> = {
    highest: {
        node: NodeInfo;
        data: Timeseries<T>;
    };
    lowest: {
        node: NodeInfo;
        data: Timeseries<T>;
    };
    average: {
        data: Timeseries<T>;
    };
    list: {
        node: NodeInfo;
        data: Timeseries<T>;
    }[]
};


// ====================================================================

declare type DashboardDataType = {
    companyInfo: {
        companyId: number;
        managedBy: number;
        name: string;
        type: string;
        createdAt?: string;
        countNodes: number
    };
    indoor: {
        countNodes: DetailCountNodes;
        data: SingleNodeAnalysis | ResultOfMultiNodeStats | null;
    };
    outdoor: {
        countNodes: DetailCountNodes;
        data: SingleNodeAnalysis | ResultOfMultiNodeStats | null;
    };
    nodes: ResultOfMappingNode[]
}

type DetailCountNodes = {
    all: number;
    active: number;
    nonactive: number;
    noSendData: number;
}
