import { VerifiablePresentation } from "@veramo/core";
import { W3CPresentation } from "did-jwt-vc";
import ErrorHandler from "../models/ErrorHandler";
import { issueVC, isIdentifier, verifyVP } from "../utils/vc-utils";
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
      domain:
        "did:ethr:rinkeby:0x0241abd662da06d0af2f0152a80bc037f65a7f901160cfe1eb35ef3f0c532a2a4d",
    };
  }
}

export = new VCController();
