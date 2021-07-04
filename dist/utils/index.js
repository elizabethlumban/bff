"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUrlQuery = void 0;
function createUrlQuery(data) {
    return Object.keys(data)
        .map(key => Array.isArray(data[key])
        ? data[key].map((v) => `${key}=${v}`).join("&")
        : `${key}=${data[key]}`)
        .join("&");
}
exports.createUrlQuery = createUrlQuery;
//# sourceMappingURL=index.js.map