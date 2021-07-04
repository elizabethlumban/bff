import { Router, Response, Request } from "express";
export class HealthController {
  public router: Router;
  constructor() {
    this.router = Router({ strict: true });
    this.router.get("/", this.showHealth);
  }
  public showHealth = async (_req: Request, res: Response, next: any) => {
    try {
      return res.json({ response: "ok" });
    } catch (e) {
      next(e);
    }
  };
}
