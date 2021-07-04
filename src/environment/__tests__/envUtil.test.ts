import "jest";
import { envName } from "../envUtil";

describe("env Util Test", () => {
  test("The test suite works", () => {
    expect(true).toBe(true);
  });

  test("Get dev environment for dev", () => {
    process.env.NODE_ENV = "dev";

    const result = envName();

    expect(result).toEqual("dev");
  });

  test("Get dev environment for undefined", () => {
    delete process.env.NODE_ENV;

    const result = envName();

    expect(result).toEqual("dev");
  });

  test("Get dev environment for development", () => {
    process.env.NODE_ENV = "development";

    const result = envName();

    expect(result).toEqual("dev");
  });

  test("Get prod environment", () => {
    process.env.NODE_ENV = "special-production";

    const result = envName();

    expect(result).toEqual("prod");
  });

  test("Get sit environment", () => {
    process.env.NODE_ENV = "sit";

    const result = envName();

    expect(result).toEqual("sit");
  });

  test("Get sit environment", () => {
    process.env.APPLICATION_ENVIRONMENT = "staging";

    const result = envName();

    expect(result).toEqual("sit");
  });
});
