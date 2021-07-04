"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const server_1 = tslib_1.__importDefault(require("./server"));
const envUtil_1 = require("./environment/envUtil");
const mongo_1 = tslib_1.__importDefault(require("./mongo"));
if (envUtil_1.isDev()) {
    console.log("isDev", envUtil_1.isDev);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("dotenv").config();
}
mongo_1.default().then(() => server_1.default());
//# sourceMappingURL=index.js.map