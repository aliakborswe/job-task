import { Router } from "express";
import { AnalyticsController } from "./analytics.controller";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

router.get("/", checkAuth, AnalyticsController.getAnalytics);

export const AnalyticsRoutes = router;
