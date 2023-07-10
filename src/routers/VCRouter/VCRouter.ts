import { NextFunction, Request, Response, Router } from "express";
import VCController from "../../controllers/VCController.js";

class VCRouter {
  private _router = Router();
  private _controller = VCController;

  get router() {
    return this._router;
  }

  constructor() {
    this._configure();
  }

  private _configure() {
    this._router.get("/", (req: Request, res: Response, next: NextFunction) => {
      res.status(200).json(this._controller.defaultMethod());
    });
    this._router.get(
      "/getVC",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const result = await this._controller.getVC(
            "majkl",
            "did:ethr:rinkeby:0x6A24687621cDD1C77Bb6aCbBEE910d0C517eB443"
          );
          res.status(200).json(result);
        } catch (error) {
          next(error);
        }
      }
    );
    this._router.post(
      "/issue-vc",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          console.log("Request body", req.body);
          if (req.body.name && req.body.id) {
            const result = await this._controller.getVC(
              req.body.name,
              req.body.id
            );
            res.status(200).json(result);
          } else {
            res.status(501).json({ error: "ID or Name not provided" });
          }
        } catch (error) {
          next(error);
        }
      }
    );
    this._router.post(
      "/verify-vp",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          //console.log("Request body", req.body);
          if (req.body.vp) {
            const result = await this._controller.verifyVP(
              req.body.vp,
              req.body.domain,
              req.body.challenge,
              req.body.subjectAddress
            );
            res.status(200).json(result);
          } else {
            res.status(501).json({ error: "ID or Name not provided" });
          }
        } catch (error) {
          next(error);
        }
      }
    );
    this._router.post(
      "/generate-challenge",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const result = await this._controller.generateChallenge();
          res.status(200).json(result);
        } catch (error) {
          next(error);
        }
      }
    );
  }
}

export default new VCRouter().router;
