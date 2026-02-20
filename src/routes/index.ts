import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { FolderRoutes } from "../modules/folder/folder.routes";
import { FileRoutes } from "../modules/file/file.routes";
import { AnalyticsRoutes } from "../modules/analytics/analytics.routes";

export const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/folders",
    route: FolderRoutes,
  },
  {
    path: "/files",
    route: FileRoutes,
  },
  {
    path: "/analytics",
    route: AnalyticsRoutes,
  }
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
