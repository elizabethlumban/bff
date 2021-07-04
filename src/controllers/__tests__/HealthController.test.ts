import "jest";
import { mockRequestResponse } from "../../testUtil";
import { HealthController } from "../HealthController";

describe("HealthController", () => {
  const { req, res, next } = mockRequestResponse();
  let controller: HealthController;

  test("the test suite is working", async () => {
    expect(true).toBe(true);
  });

  describe("GET /v1/health", () => {
    test("get works", async () => {
      // no setup

      controller = new HealthController();
      await controller.showHealth(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ update: "I am alive" });
    });

    test("get returns 500 on error", async () => {
      const e = new Error("I am dead");
      res.json.mockImplementationOnce(() => {
        throw e;
      });

      controller = new HealthController();
      await controller.showHealth(req, res, next);

      expect(next).toHaveBeenCalledWith(e);
    });
  });
});
