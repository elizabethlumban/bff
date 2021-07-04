"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const express_1 = require("express");
class HealthController {
    constructor() {
        this.showHealth = async (_req, res, next) => {
            try {
                return res.json({ response: "ok" });
            }
            catch (e) {
                next(e);
            }
        };
        this.router = express_1.Router({ strict: true });
        this.router.get("/", this.showHealth);
    }
}
exports.HealthController = HealthController;
//# sourceMappingURL=HealthController.js.map