"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectionURL = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const envUtil_1 = require("./environment/envUtil");
mongoose_1.default.Promise = global.Promise;
const connectToDb = () => {
    const url = exports.getConnectionURL();
    console.log('connectToDb--->', url);
    const options = getConnectionOptions();
    return new Promise((resolve, reject) => mongoose_1.default.connect(url, options, err => {
        err ? reject(err) : resolve();
    }));
};
/* export function getMongoDeployment() {
  const services = JSON.parse(process.env.VCAP_SERVICES!);
  const cfMongodbServices = services["databases-for-mongodb"];
  let mongodbConn;
  // test Cloud Foundary Environment
  if (cfMongodbServices) {
    mongodbConn = cfMongodbServices[0].credentials.connection.mongodb;
  }
  // try K8 environment binding
  if (!mongodbConn && process.env.MONGO_BINDING) {
    const binding = JSON.parse(process.env.MONGO_BINDING);
    mongodbConn = binding.connection.mongodb;
  }
  return mongodbConn;
} */
function getConnectionOptions() {
    if (envUtil_1.isDev()) {
        return {
            reconnectTries: 4
        };
    }
    const mongodbConn = getMongoDeployment();
    const options = {
        ssl: true,
        sslValidate: true,
        poolSize: 50,
        reconnectTries: 4,
        useNewUrlParser: true
    };
    if (process.env.MONGODB_USE_SSL) {
        options.ssl = process.env.MONGODB_USE_SSL == "true";
    }
    if (process.env.MONGODB_VALIDATE_SSL) {
        options.sslValidate = process.env.MONGODB_VALIDATE_SSL == "true";
    }
    if (mongodbConn && mongodbConn.certificate.certificate_base64) {
        const ca = [Buffer.from(mongodbConn.certificate.certificate_base64, "base64")];
        options.sslCA = ca;
    }
    return options;
}
/* export function getConnectionURI(options = undefined) {
  let mongoURI;
  let mongodbConn;

  // overide from env
  let mongodburlEnv = process.env.MONGODB_URL;
  if (mongodburlEnv) mongoURI = mongodburlEnv;

  mongodbConn = getMongoDeployment(options);

  if (mongodbConn) {
    let authentication = mongodbConn.authentication;
    let username = authentication.username;
    let password = authentication.password;
    let database = mongodbConn.database;

    if (mongodbConn.composed && mongodbConn.composed.length > 0) {
      mongoURI = mongodbConn.composed[0];
    } else {
      let connectionPath = mongodbConn.hosts;
      let connectionString = `mongodb://${username}:${password}@${connectionPath[0].hostname}:${connectionPath[0].port},${connectionPath[1].hostname}:${connectionPath[1].port}/${database}?authSource=admin&replicaSet=replset`;
      mongoURI = connectionString;
    }
  }

  return mongoURI;
}
 */
const getMongoDeployment = (options = undefined) => {
    const appenv = require("cfenv").getAppEnv(options);
    const { services } = appenv;
    const cfMongodbServices = services["databases-for-mongodb"];
    let mongodbConn;
    // test Cloud Foundary Environment
    if (cfMongodbServices) {
        mongodbConn = cfMongodbServices[0].credentials.connection.mongodb;
    }
    // try K8 environment binding
    if (!mongodbConn && process.env.MONGO_BINDING) {
        const binding = JSON.parse(process.env.MONGO_BINDING);
        mongodbConn = binding.connection.mongodb;
    }
    return mongodbConn;
};
const getConnectionURI = (options = undefined) => {
    let mongoURI;
    let mongodbConn;
    // overide from env
    let mongodburlEnv = process.env.MONGODB_URL;
    if (mongodburlEnv)
        mongoURI = mongodburlEnv;
    mongodbConn = getMongoDeployment(options);
    if (mongodbConn) {
        let authentication = mongodbConn.authentication;
        let username = authentication.username;
        let password = authentication.password;
        let database = mongodbConn.database;
        if (mongodbConn.composed && mongodbConn.composed.length > 0) {
            mongoURI = mongodbConn.composed[0];
        }
        else {
            let connectionPath = mongodbConn.hosts;
            let connectionString = `mongodb://${username}:${password}@${connectionPath[0].hostname}:${connectionPath[0].port},${connectionPath[1].hostname}:${connectionPath[1].port}/${database}?authSource=admin&replicaSet=replset`;
            mongoURI = connectionString;
        }
    }
    return mongoURI;
};
const uriFromVCAP = () => {
    const services = JSON.parse(process.env.VCAP_SERVICES);
    const cfMongodbServices = services["databases-for-mongodb"];
    return cfMongodbServices[0].credentials.connection.mongodb.composed[0];
};
exports.getConnectionURL = () => {
    console.log("isDev", envUtil_1.isDev);
    //return isDev() ? "mongodb://localhost/testdb" : uriFromVCAP();
    return envUtil_1.isDev() ? "mongodb://localhost/testdb" : getConnectionURI();
};
exports.default = connectToDb;
//# sourceMappingURL=mongo.js.map