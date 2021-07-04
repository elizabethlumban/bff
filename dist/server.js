"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
//import express from 'express';
const express_1 = tslib_1.__importDefault(require("express"));
const compression_1 = tslib_1.__importDefault(require("compression"));
const helmet_1 = tslib_1.__importDefault(require("helmet"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const body_parser_1 = tslib_1.__importDefault(require("body-parser"));
const morgan_body_1 = tslib_1.__importDefault(require("morgan-body"));
const routes_1 = tslib_1.__importDefault(require("./routes"));
async function startServer() {
    const app = express_1.default();
    const port = process.env.PORT || 5001;
    // Common middleware
    app.use(cors_1.default());
    app.use(compression_1.default({ level: 9 }));
    app.use(helmet_1.default());
    app.use(body_parser_1.default.urlencoded({ extended: true }));
    app.use(body_parser_1.default.json({ limit: "50mb" }));
    app.use(body_parser_1.default.text({ type: "plain/text" }));
    const morganOptions = process.env.MORGAN_OPTS;
    if (morganOptions) {
        morgan_body_1.default(app, JSON.parse(morganOptions));
    }
    else {
        morgan_body_1.default(app);
    }
    // Set Up the controllers and routes
    routes_1.default(app);
    app.listen(port, () => console.log(`Server is on port ${port}`));
}
exports.default = startServer;
//# sourceMappingURL=server.js.map