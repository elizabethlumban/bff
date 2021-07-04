import startServer from "./server";
import { isDev, envName } from "./environment/envUtil";
import connectToDb from "./mongo";
if (isDev()) {
  console.log("isDev", envName());
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("dotenv").config();
}
connectToDb().then(() => startServer());
