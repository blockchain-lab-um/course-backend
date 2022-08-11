import { Router } from "express";
import VCRouter from "./VCRouter/VCRouter";

class MasterRouter {
  private _router = Router();
  private _vcRouter = VCRouter;

  get router() {
    return this._router;
  }

  constructor() {
    this._configure();
  }

  private _configure() {
    this._router.use("/vc", this._vcRouter);
  }
}

export = new MasterRouter().router;
