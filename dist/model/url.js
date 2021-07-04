"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importStar(require("mongoose"));
const urlSchema = new mongoose_1.Schema({
    full: {
        type: String,
        required: true
    },
    short: {
        type: String,
        required: true
    },
    clicks: {
        type: Number,
        required: true,
        default: 0
    }
});
exports.Document = mongoose_1.default.model('shorturl', urlSchema);
//# sourceMappingURL=url.js.map