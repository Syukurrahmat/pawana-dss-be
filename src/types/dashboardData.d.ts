import { Moment } from 'moment';
import Companies from '../models/companies.ts';
import EventLogs from '../models/eventLogs.ts';
import Nodes from '../models/nodes.ts';
import Reports from '../models/reports.ts';

type Timeseries<V = number> = { datetime: Date; value: V };

type ISPUValue = [ISPUValueItem, ISPUValueItem] | null;

type GRKValue = {
    value: number;
    category?: string;
    recomendation?: Recomendation;
};

type ISPUValueItem = {
    pollutant: 'PM100' | 'PM25';
    ispu: number;
    ispuFloat: number;
    pollutantValue: number;
    category?: string;
    recomendation?: Recomendation;
};

type Recomendation = {
    info: string;
    company: string;
    public: string;
};

// ============================================================================

declare type NodeWithLatestData = Nodes & {
    latestData?: {
        ispu: Timeseries<ISPUValue>;
        ch4: Timeseries<GRKValue>;
        co2: Timeseries<GRKValue>;
        pm25: Timeseries<number>;
        pm100: Timeseries<number>;
    };

    PMDatalogs?: {
        ispuHour: Moment;
        tren: {
            datetime: Date;
            pm100: number;
            pm25: number;
        }[];
    };
};

// ============================================================================

type SingleNodeInsight = {
    node: {
        name: string;
        nodeId: number;
        lastDataSent: Date;
    };
    ispu: SingleNodeInsightItem<[ISPUValueItem, ISPUValueItem] | null>;
    ch4: SingleNodeInsightItem<GRKValue>;
    co2: SingleNodeInsightItem<GRKValue>;
};

type SingleNodeInsightItem<V> = {
    latestData: Timeseries<V>;
    tren: Timeseries<V>[];
};

// ============================================================================

type MultiNodeInsight = {
    ispu: NodeStatistic<ISPUValue>;
    ch4: NodeStatistic<GRKValue>;
    co2: NodeStatistic<GRKValue>;
};

type NodeStatistic<T> = {
    average: {
        data: Timeseries<T>;
    };
    highest: {
        nodeId: number;
        name: string;
        lastDataSent: Date;
        data: Timeseries<T>;
    };
    lowest: {
        nodeId: number;
        name: string;
        lastDataSent: Date;
        data: Timeseries<T>;
    };
};

// ====================================================================

declare type DashboardData = {
    dashboardInfo: {
        name: string;
        type: string;
        countNodes: number;
        companyId?: number;
        userId?: number;
        managedBy?: number;
        createdAt?: string;
    };
    indoor?: NodesGroup;
    outdoor: NodesGroup;
    nodes: {
        indoor?: NodeWithLatestData[];
        outdoor: NodeWithLatestData[];
    };
    currentEventLogs: EventLogs[];
    nearReports: Reports[];
};

type NodesGroup = {
    analiysisDataType: string;
    countNodes: {
        all: number;
        active: number;
    };
    data: SingleNodeInsight | MultiNodeInsight | null;
};

// ====================================================================
// ====================================================================

type SimpleDatalogs = {
    datetime: Date;
    pm25: number;
    pm100: number;
    ch4: number;
    co2: number;
};

type PMDatalogs = {
    datetime: Date;
    pm100: number;
    pm25: number;
};

type NodesAverageInsightWithDate = SummaryAverageInsight & {
    datetime: Date;
};
// ====================================================================

type TrenItem = {
    datetime: Date;
    indoor?: SummaryAverageInsight;
    outdoor?: SummaryAverageInsight;
};

type SummaryAverageInsight = {
    ispu: ISPUValue | null;
    co2: GRKValue;
    ch4: GRKValue;
    pm25: number;
    pm100: number;
};

type SummaryData = {
    meta: {
        company: Companies;
        startDate: Date;
        endDate: Date;
    };
    averageData: {
        indoor?: SummaryAverageInsight;
        outdoor?: SummaryAverageInsight;
    };
    tren: TrenItem[];
    reports: ReportSummary;
    eventLogs: EventLogsSummary;
};

type ReportSummary = {
    average: number;
    count: number;
    countPerStar: number[];
    reports: Reports[];
};

type EventLogsSummary = {
    count: {
        all: number;
        countStatus: {
            status: string;
            count: number;
        }[];
        countType: {
            type: string;
            count: number;
            days: number;
        }[];
    };
    eventIdLongestEvent: number | undefined;
    eventLogs: EventLogs[];
};
