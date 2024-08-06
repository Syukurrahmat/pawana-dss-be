import Companies from "../models/companies.ts";
import EventLogs from "../models/eventLogs.ts";
import Reports from "../models/reports.ts";
import { GRKCategorize, ISPUValue } from "./dashboardData.js";


type DataLogWithAnalize = {
    datetime: Date;
    ispu: [ISPUValue, ISPUValue] | [];
    co2: GRKCategorize;
    ch4: GRKCategorize;
    pm25: number;
    pm100: number;
}

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