import startServer from "./server";
import { isDev } from "./environment/envUtil";
import connectToDb from "./mongo";
if (isDev()) {
  console.log("isDev", isDev);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("dotenv").config();
}
connectToDb().then(() => startServer());
