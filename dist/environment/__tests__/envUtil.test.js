"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const envUtil_1 = require("../envUtil");
describe("env Util Test", () => {
    test("The test suite works", () => {
        expect(true).toBe(true);
    });
    test("Get dev environment for dev", () => {
        process.env.NODE_ENV = "dev";
        const result = envUtil_1.envName();
        expect(result).toEqual("dev");
    });
    test("Get dev environment for undefined", () => {
        delete process.env.NODE_ENV;
        const result = envUtil_1.envName();
        expect(result).toEqual("dev");
    });
    test("Get dev environment for development", () => {
        process.env.NODE_ENV = "development";
        const result = envUtil_1.envName();
        expect(result).toEqual("dev");
    });
    test("Get prod environment", () => {
        process.env.NODE_ENV = "special-production";
        const result = envUtil_1.envName();
        expect(result).toEqual("prod");
    });
    test("Get sit environment", () => {
        process.env.NODE_ENV = "sit";
        const result = envUtil_1.envName();
        expect(result).toEqual("sit");
    });
    test("Get sit environment", () => {
        process.env.APPLICATION_ENVIRONMENT = "staging";
        const result = envUtil_1.envName();
        expect(result).toEqual("sit");
    });
});
//# sourceMappingURL=envUtil.test.js.map