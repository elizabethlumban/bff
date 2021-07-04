"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemsController = void 0;
const url_1 = require("../model/url");
const nanoid_1 = require("nanoid");
const express_1 = require("express");
class ItemsController {
    constructor() {
        this.postOne = async (req, res, next) => {
            try {
                const fullUrl = req.body.fullUrl;
                const hashValue = nanoid_1.nanoid();
                const record = new url_1.Document({
                    full: fullUrl,
                    short: hashValue
                });
                const result = await record.save();
                if (!result) {
                    throw new Error(`Error while saving }`);
                }
                return res.json([{ name: hashValue, origURL: fullUrl }]);
            }
            catch (e) {
                next(e);
            }
        };
        this.getOne = async (req, res, next) => {
            try {
                const shortid = req.params.hashId;
                const record = await url_1.Document.findOne({ short: shortid });
                if (!record)
                    return res.sendStatus(404);
                return res.json(record.full);
            }
            catch (e) {
                next(e);
            }
        };
        this.router = express_1.Router({ strict: true });
        this.router.get("/:hashId", this.getOne);
        this.router.post("/", this.postOne);
    }
}
exports.ItemsController = ItemsController;
//# sourceMappingURL=ItemsController.js.map