import { VerifiablePresentation } from "@veramo/core";
import { W3CPresentation } from "did-jwt-vc";
import ErrorHandler from "../models/ErrorHandler.js";
import { issueVC, isIdentifier, verifyVP } from "../utils/vc-utils.js";
import { v4 as uuidv4 } from "uuid";

class VCController {
  constructor() {}
  defaultMethod() {
    return {
      text: `You've reached the ${this.constructor.name} default method`,
    };
  }
  async getVC(name: string, id: string) {
    //Check if id is valid
    if (!isIdentifier(id)) {
      throw new ErrorHandler(501, "", `Identifier ${id} is not valid!`);
    }
    const res = await issueVC(name, id);
    //console.log(res);
    if (res === "error") {
      throw new ErrorHandler(501, "", "Server not working properly");
    } else return res;
  }

  async verifyVP(
    vp: VerifiablePresentation,
    domain: string,
    challenge: string,
    address: string
  ) {
    try {
      const res = await verifyVP(vp, domain, challenge, address);
      return res;
    } catch (e) {
      console.log("VP err:", e);
    }
  }

  generateChallenge() {
    return {
      challenge: uuidv4(),
      domain: process.env.VC_ISSUER,
    };
  }
}

export default new VCController();
