import { Router } from "express";

export const router = Router();

const moduleRoutes = [
    {
        path: "/user",
        route: (req, res) => {
            res.send("User route");
        },
    }
]

moduleRoutes.forEach((route)=>{
    router.get(route.path, route.route);
})