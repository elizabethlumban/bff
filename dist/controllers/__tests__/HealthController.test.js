"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const testUtil_1 = require("../../testUtil");
const HealthController_1 = require("../HealthController");
describe("HealthController", () => {
    const { req, res, next } = testUtil_1.mockRequestResponse();
    let controller;
    test("the test suite is working", async () => {
        expect(true).toBe(true);
    });
    describe("GET /v1/health", () => {
        test("get works", async () => {
            // no setup
            controller = new HealthController_1.HealthController();
            await controller.showHealth(req, res, next);
            expect(res.json).toHaveBeenCalledWith({ update: "I am alive" });
        });
        test("get returns 500 on error", async () => {
            const e = new Error("I am dead");
            res.json.mockImplementationOnce(() => {
                throw e;
            });
            controller = new HealthController_1.HealthController();
            await controller.showHealth(req, res, next);
            expect(next).toHaveBeenCalledWith(e);
        });
    });
});
//# sourceMappingURL=HealthController.test.js.map