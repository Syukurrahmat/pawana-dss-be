import Companies from "../models/companies.ts";
import EventLogs from "../models/eventLogs.ts";
import Reports from "../models/reports.ts";
import { GRKCategorize, ISPUValue } from "./dashboardData.js";


type BasicDataLog = {
    datetime: Date;
    pm25: number;
    pm100: number;
    ch4: number;
    co2: number;
};

type DataLogWithAnalize = {
    datetime: Date;
    ispu: [ISPUValue, ISPUValue] | null;
    co2: GRKCategorize;
    ch4: GRKCategorize;
    pm25: number;
    pm100: number;
}

type CombinedTren = {
    datetime: Date;
    indoor?: Omit<DataLogWithAnalize, 'datetime'>;
    outdoor?: Omit<DataLogWithAnalize, 'datetime'>;
};


type SummaryDataAverage = {
    ispu: [ISPUValue, ISPUValue] | null;
    co2: GRKCategorize;
    ch4: GRKCategorize;
    pm25: number;
    pm100: number;
}

type Summary = {
    meta: {
        company: Companies,
        startDate: Date;
        endDate: Date;
    },
    averageData: {
        indoor?: SummaryDataAverage;
        outdoor?: SummaryDataAverage;
    };
    tren: {
        datetime: Date;
        indoor?: SummaryDataAverage;
        outdoor?: SummaryDataAverage;
    }[];
    reports: {
        average: number;
        count: number;
        countPerStar: number[];
        reports: Reports[];
    }
    eventLogs: {
        count: {
            all: number;
            countStatus: {
                status: string;
                count: number;
            }[];
            countType: {
                type: string;
                count: number;
                days : number
            }[];
        };
        eventIdLongestEvent: number | undefined;
        eventLogs: EventLogs[];
    }
}