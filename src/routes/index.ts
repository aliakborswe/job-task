import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { FolderRoutes } from "../modules/folder/folder.routes";

export const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/folders",
    route: FolderRoutes,
  }
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
