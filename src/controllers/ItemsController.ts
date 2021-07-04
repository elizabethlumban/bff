import { Document } from '../model/url';
import { nanoid } from 'nanoid';
import { Router, Response, Request } from "express";
export class ItemsController {
    public router: Router;
    constructor() {
        this.router = Router({ strict: true });
        this.router.get("/:hashId", this.getOne);
        this.router.post("/",  this.postOne)
    }
    public postOne = async (req: Request, res: Response, next: any) => {
        try {
            const fullUrl = req.body.fullUrl;
            const hashValue = nanoid();
            const record = new Document({
                full: fullUrl,
                short: hashValue
            });
            const result = await record.save();
            if (!result) {
                throw new Error(`Error while saving }`);
            }
            return res.json([{ name: hashValue, origURL: fullUrl }]);
        } catch (e) {
            next(e);
        }
    };
    public getOne = async (req: Request, res: Response, next: any) => {
        try {
            const shortid = req.params.hashId;
            const record = await Document.findOne({ short: shortid });
            if (!record) return res.sendStatus(404);
            return res.json(record.full);
        } catch (e) {
            next(e);
        }
    };
}
