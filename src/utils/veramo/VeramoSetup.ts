// Core interfaces
import {
  createAgent,
  IDIDManager,
  IResolver,
  IDataStore,
  IKeyManager,
  IMessageHandler,
} from "@veramo/core";

// Core identity manager plugin
import { DIDManager } from "@veramo/did-manager";

// Ethr did identity provider
import { EthrDIDProvider } from "@veramo/did-provider-ethr";

// Web did identity provider
import { WebDIDProvider } from "@veramo/did-provider-web";

// Core key manager plugin
import { KeyManager } from "@veramo/key-manager";

// Custom key management system for RN
import { KeyManagementSystem, SecretBox } from "@veramo/kms-local";

// Custom resolvers
import { DIDResolverPlugin } from "@veramo/did-resolver";
import { Resolver } from "did-resolver";
import { getResolver as ethrDidResolver } from "ethr-did-resolver";

import {
  CredentialIssuerLD,
  ICredentialIssuerLD,
  LdDefaultContexts,
  VeramoEcdsaSecp256k1RecoverySignature2020,
  VeramoEd25519Signature2018,
} from "@veramo/credential-ld";

// Storage plugin using TypeOrm
import {
  Entities,
  KeyStore,
  DIDStore,
  PrivateKeyStore,
  migrations,
  DataStore,
} from "@veramo/data-store";

// TypeORM is installed with `@veramo/data-store`
import { createConnection } from "typeorm";
import {
  CredentialIssuer,
  CredentialPlugin,
  ICredentialIssuer,
  W3cMessageHandler,
} from "@veramo/credential-w3c";
import {
  CredentialIssuerEIP712,
  ICredentialIssuerEIP712,
} from "@veramo/credential-eip712";

// This will be the name for the local sqlite database for demo purposes
const DATABASE_FILE = "database.sqlite";

// You will need to get a project ID from infura https://www.infura.io
const INFURA_PROJECT_ID = "ae403e9efbee4afca0428b30f44bf661";

// This will be the secret key for the KMS
const KMS_SECRET_KEY =
  "4758280b89b44a6a96f2d482b8abaab68f7ee732e67905754b44f7deef79e623";

const dbConnection = createConnection({
  type: "sqlite",
  database: DATABASE_FILE,
  synchronize: false,
  migrations,
  migrationsRun: true,
  logging: ["error", "info", "warn"],
  entities: Entities,
});

const networks = [
  {
    name: "goerli",
    chainId: 5,
    rpcUrl: "https://goerli.infura.io/v3/" + INFURA_PROJECT_ID,
  },
  {
    name: "0x05",
    rpcUrl: "https://goerli.infura.io/v3/" + INFURA_PROJECT_ID,
  },
];

export const agent = createAgent<
  IDIDManager &
    IKeyManager &
    IDataStore &
    IResolver &
    ICredentialIssuer &
    ICredentialIssuerEIP712 &
    ICredentialIssuerLD &
    IMessageHandler
>({
  plugins: [
    new CredentialPlugin(),
    new CredentialIssuerEIP712(),
    new DataStore(dbConnection),
    new CredentialIssuerLD({
      contextMaps: [LdDefaultContexts],
      suites: [
        new VeramoEd25519Signature2018(),
        new VeramoEcdsaSecp256k1RecoverySignature2020(),
      ],
    }),
    new KeyManager({
      store: new KeyStore(dbConnection),
      kms: {
        local: new KeyManagementSystem(
          new PrivateKeyStore(dbConnection, new SecretBox(KMS_SECRET_KEY))
        ),
      },
    }),
    new DIDManager({
      store: new DIDStore(dbConnection),
      defaultProvider: "did:ethr",
      providers: {
        "did:ethr": new EthrDIDProvider({
          defaultKms: "local",
          networks,
        }),
      },
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({
          networks,
        }),
      }),
    }),
  ],
});
