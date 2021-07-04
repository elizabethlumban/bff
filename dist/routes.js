"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const HealthController_1 = require("./controllers/HealthController");
const ItemsController_1 = require("./controllers/ItemsController");
function setupRoutes(app) {
    const router = express_1.Router();
    app.use("/apis", router);
    router.use(logCacheControlHeader);
    setUpControllers(router);
}
exports.default = setupRoutes;
function logCacheControlHeader(req, _res, next) {
    console.log("cache-control header", req.headers["cache-control"]);
    next();
}
/**
 * Set ups the paths to each of the controller's routers
 * Please add your route here when you add a new controller
 * @param router The main app router
 */
function setUpControllers(router) {
    // console.log("setupcontrollers");
    router.use("/v1/health", new HealthController_1.HealthController().router);
    router.use("/v1/items", new ItemsController_1.ItemsController().router);
}
//# sourceMappingURL=routes.js.map