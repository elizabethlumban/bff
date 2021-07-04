"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envName = exports.isProd = exports.isStaging = exports.isDev = void 0;
exports.isDev = () => !process.env.NODE_ENV || process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev";
exports.isStaging = () => !exports.isDev() && (process.env.APPLICATION_ENVIRONMENT === "staging" || process.env.NODE_ENV === "sit");
exports.isProd = () => !exports.isDev() && !exports.isStaging();
exports.envName = () => {
    if (exports.isDev()) {
        return "dev";
    }
    else if (exports.isStaging()) {
        return "sit";
    }
    else if (exports.isProd()) {
        return "prod";
    }
};
//# sourceMappingURL=envUtil.js.map