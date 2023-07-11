import {
  MinimalImportableIdentifier,
  VerifiableCredential,
  VerifiablePresentation,
} from "@veramo/core";
import { agent } from "./veramo/VeramoSetup.js";
import Web3 from "web3";
import { Resolver } from "did-resolver";
import { getResolver as ethrDidResolver } from "ethr-did-resolver";
import "dotenv/config";

import { decodeJwt, JWTPayload } from "jose";
import { randomUUID } from "crypto";

const INFURA_PROJECT_ID = process.env.INFURA_ID;
const RPC_URL = process.env.RPC_URL;
const ADDRESS = process.env.ETH_IDENTIFIER;
const PRIVATE_KEY = process.env.ETH_PRIVATE_KEY;
const VC_ISSUER = process.env.VC_ISSUER;
const networks = [
  {
    name: "goerli",
    chainId: 5,
    rpcUrl: RPC_URL,
  },
  {
    name: "0x05",
    rpcUrl: RPC_URL,
  },
];
const didResolver = new Resolver(ethrDidResolver({ networks }));

import Ajv from "ajv";
import formatsPlugin from "ajv-formats";
// const Ajv = require("ajv");
const ajv = new Ajv({ allowUnionTypes: true, strict: false });
//const addFormats = require("ajv-formats");
formatsPlugin(ajv);

const schemaEIP712 = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/json-schema.json",
  title: "Program Completion Certificate",
  $metadata: {
    slug: "program-completion-certificate",
    version: "1.0",
    icon: "🎓",
    discoverable: true,
    uris: {
      jsonLdContextPlus:
        "https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/ld-context-plus.json",
      jsonLdContext:
        "https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/ld-context.json",
      jsonSchema:
        "https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/json-schema.json",
    },
  },
  description:
    "The subject of this credential has successfully completed a program or accomplishment.",
  type: "object",
  required: ["@context", "type", "credentialSubject"],
  properties: {
    "@context": { type: ["string", "array", "object"] },
    id: { type: "string", format: "uri" },
    type: { type: ["string", "array"], items: { type: "string" } },
    iss: {
      type: ["string", "object"],
      format: "uri",
      required: ["id"],
      properties: { id: { type: "string", format: "uri" } },
    },
    issuanceDate: { type: "string", format: "date-time" },
    expirationDate: { type: "string", format: "date-time" },
    credentialSubject: {
      type: "object",
      required: [
        "accomplishmentType",
        "learnerName",
        "achievement",
        "courseProvider",
      ],
      properties: {
        id: { title: "Credential Subject ID", type: "string", format: "uri" },
        accomplishmentType: {
          title: "Accomplishment Type",
          description: "",
          type: "string",
        },
        learnerName: { title: "Learner Name", description: "", type: "string" },
        achievement: { title: "Achievement", description: "", type: "string" },
        courseProvider: {
          title: "Course Provider",
          description: "",
          type: "string",
          format: "uri",
        },
      },
    },
    credentialSchema: {
      type: "object",
      required: ["id", "type"],
      properties: {
        id: { type: "string", format: "uri" },
        type: { type: "string" },
      },
    },
  },
};

const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/json-schema.json",
  title: "Program Completion Certificate",
  $metadata: {
    slug: "program-completion-certificate",
    version: "1.0",
    icon: "🎓",
    discoverable: true,
    uris: {
      jsonLdContextPlus:
        "https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/ld-context-plus.json",
      jsonLdContext:
        "https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/ld-context.json",
      jsonSchema:
        "https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/json-schema.json",
    },
  },
  description:
    "The subject of this credential has successfully completed a program or accomplishment.",
  type: "object",
  required: ["@context", "type", "issuer", "issuanceDate", "credentialSubject"],
  properties: {
    "@context": { type: ["string", "array", "object"] },
    type: { type: ["string", "array"], items: { type: "string" } },
    iss: {
      type: ["string", "object"],
      format: "uri",
      required: ["id"],
      properties: { id: { type: "string", format: "uri" } },
    },
    issuanceDate: { type: "string", format: "date-time" },
    expirationDate: { type: "string", format: "date-time" },
    credentialSubject: {
      type: "object",
      required: [
        "id",
        "accomplishmentType",
        "learnerName",
        "achievement",
        "courseProvider",
      ],
      properties: {
        id: { title: "Credential Subject ID", type: "string", format: "uri" },
        accomplishmentType: {
          title: "Accomplishment Type",
          description: "",
          type: "string",
        },
        learnerName: { title: "Learner Name", description: "", type: "string" },
        achievement: { title: "Achievement", description: "", type: "string" },
        courseProvider: {
          title: "Course Provider",
          description: "",
          type: "string",
          format: "uri",
        },
      },
    },
    credentialSchema: {
      type: "object",
      required: ["id", "type"],
      properties: {
        id: { type: "string", format: "uri" },
        type: { type: "string" },
      },
    },
  },
};

export async function issueVC(
  name: string,
  claimerId: string
): Promise<VerifiableCredential | string> {
  const identifiers = await agent.didManagerFind();
  let identifier: string = "";
  if (identifiers.length > 0) {
    identifiers.map((id) => {
      identifier = id.did;
    });

    //   const did = await agent.didManagerCreate();
    const verifiableCredential = await agent.createVerifiableCredential({
      credential: {
        id: randomUUID(),
        issuer: {
          id: identifier,
        },
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/ld-context.json",
        ],
        credentialSchema: {
          id: "https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/json-schema.json",
          type: "JsonSchemaValidator2018",
        },
        type: ["VerifiableCredential", "ProgramCompletionCertificate"],

        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: claimerId,
          accomplishmentType: "Developer Certificate",
          learnerName: name,
          achievement: "Certified Solidity Developer Test",
          courseProvider: "https://blockchain-lab.um.si/",
        },
      },
      save: false,
      proofFormat: "jwt",
    });
    return verifiableCredential as VerifiableCredential;
  } else {
    const importId = {
      did: VC_ISSUER as string,
      provider: "did:ethr:goerli",
      keys: [
        {
          kms: "local",
          type: "Secp256k1",
          privateKeyHex: PRIVATE_KEY as string,
        },
      ],
    } as MinimalImportableIdentifier;
    await agent.didManagerImport(importId);
    return "error";
  }
}

const resolveDidEthr = async (mmAddr: string, delAddr: string) => {
  const didDocument = (await didResolver.resolve(delAddr)).didDocument;

  const veriKeys = didDocument?.verificationMethod;
  let retVal = false;
  if (veriKeys != null) {
    veriKeys.map((key) => {
      if (
        key.publicKeyHex?.toString().toUpperCase() ===
        delAddr.substring(2).toUpperCase()
      ) {
        retVal = true;
      }
      let blockchainAccountId = key.blockchainAccountId;
      if (blockchainAccountId?.includes("eip155:5:")) {
        blockchainAccountId = blockchainAccountId.split(":")[2];
      }
      if (
        blockchainAccountId?.toUpperCase().substring(0, 42) ===
        mmAddr.toUpperCase().substring(0, 42)
      ) {
        retVal = true;
      }
    });
  }
  return retVal;
};

export async function verifyVP(
  vp: VerifiablePresentation,
  domain: string,
  challenge: string,
  address: string
) {
  //Check for EIP712 or JWT VP
  try {
    //JWT
    if (vp.proof.type && vp.proof.type == "JwtProof2020") {
      const res = await agent.verifyPresentation({
        presentation: vp,
        challenge: challenge,
        domain: domain,
      });
      if (res) {
        if (vp.verifiableCredential) {
          const unresolved: Array<Promise<boolean>> =
            vp.verifiableCredential?.map(async (vc): Promise<boolean> => {
              vc = vc as VerifiableCredential;
              // 1. Check if JWT is valid
              const res = await agent.verifyCredential({ credential: vc });
              const decoded: JWTPayload = decodeJwt(vc.proof.jwt);
              if (!res) return false;
              // 2. Check if VC uses the correct schema
              const validate = ajv.compile(schema);
              if (!validate(vc)) {
                return false;
              }
              let issuer = JSON.parse(JSON.stringify(vc.issuer));
              // 3. verify if JWT content == VC content

              if (
                decoded.sub != vc.credentialSubject.id ||
                decoded.iss != issuer.id ||
                (decoded as any).vc.credentialSubject.accomplishmentType !=
                  vc.credentialSubject.accomplishmentType ||
                (decoded as any).vc.credentialSubject.achievement !=
                  vc.credentialSubject.achievement
              ) {
                return false;
              }
              // 4. verify if subject == wallet connected to the dApp
              if (vc.credentialSubject.id?.split(":")[3] != address) {
                return false;
              }
              // 5. verify issuer
              if (issuer.id !== process.env.VC_ISSUER) {
                return false;
              }
              // 6. verify VP holder
              if (vp.holder != vc.credentialSubject.id) {
                // 6.1. verify if delegate exists
                if (
                  vc.credentialSubject.id &&
                  (await resolveDidEthr(
                    vc.credentialSubject.id?.split(":")[3],
                    vp.holder.split(":")[3]
                  ))
                ) {
                } else {
                  return false;
                }
              }
              return true;
            });
          const resolved = await Promise.all(unresolved);
          return resolved.includes(true);
        } else return false;
      } else return res;
    }
    //EIP712
    else if (vp.proof.type && vp.proof.type == "EthereumEip712Signature2021") {
      const res = await agent.verifyPresentationEIP712({
        presentation: vp,
      });
      if (res) {
        if (vp.verifiableCredential) {
          const unresolved: Array<Promise<boolean>> =
            vp.verifiableCredential?.map(async (vcJwt): Promise<boolean> => {
              vcJwt = vcJwt as string;

              //0. Decode JWT
              const vc = decodeJwt(vcJwt) as VerifiableCredential;
              // 1. Check if JWT is valid
              const res = await agent.verifyCredential({ credential: vcJwt });
              if (!res) return false;
              // 2. Check if VC uses the correct schema
              const validate = ajv.compile(schemaEIP712);
              if (!validate(vc.vc)) {
                return false;
              }

              let issuer = JSON.parse(JSON.stringify(vc.iss));
              // 4. verify if subject == wallet connected to the dApp
              if (vc.sub.split(":")[3] != address) {
                return false;
              }
              // 5. verify issuer
              if (issuer !== process.env.VC_ISSUER) {
                return false;
              }
              // 6. verify VP holder
              if (
                vp.holder.split(":")[3].toUpperCase() !=
                vc.sub.split(":")[3].toUpperCase()
              ) {
                // 6.1. verify if delegate exists
                if (
                  vc.credentialSubject.id &&
                  (await resolveDidEthr(
                    vc.credentialSubject.id?.split(":")[3],
                    vp.holder.split(":")[3]
                  ))
                ) {
                } else {
                  return false;
                }
              }
              return true;
            });
          const resolved = await Promise.all(unresolved);
          return resolved.includes(true);
        } else return false;
      } else return res;
    }
  } catch (e) {
    return false;
  }
}

export function isIdentifier(identifier: string) {
  const parts = identifier.split(":");
  if (
    parts.length < 3 ||
    parts.length > 4 ||
    parts[0] != "did" ||
    parts[1] != "ethr"
  ) {
    return false;
  }
  if (
    parts.length == 4 &&
    !(parts[2] == "goerli" || parts[2] == "0x5" || parts[2] == "0x05") &&
    Web3.utils.isAddress(parts[3])
  )
    return false;
  if (parts.length == 3 && !Web3.utils.isAddress(parts[2])) {
    return false;
  }
  return true;
}
