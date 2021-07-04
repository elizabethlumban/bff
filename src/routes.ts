import { Express } from "express";
import { Router } from "express";
import { HealthController } from "./controllers/HealthController";
import { ItemsController } from "./controllers/ItemsController";


export default function setupRoutes(app: Express) {
  const router = Router();
  app.use("/apis", router);
  router.use(logCacheControlHeader);
  setUpControllers(router);
}

function logCacheControlHeader(req: any, _res: any, next: any) {
  console.log("cache-control header", req.headers["cache-control"]);
  next();
}

/**
 * Set ups the paths to each of the controller's routers
 * Please add your route here when you add a new controller
 * @param router The main app router
 */
function setUpControllers(router: Router) {
  // console.log("setupcontrollers");
  router.use("/v1/health", new HealthController().router);
  router.use("/v1/items", new ItemsController().router);
}
