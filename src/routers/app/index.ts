import { Router } from "express";
import dashboardData from "../dashboardData.js";

const appRouter = Router()

appRouter.get('/dashboard/data', async (req, res) => {
    const companyId = req.query.companyid as string
    res.json(await dashboardData())
});


export default appRouter