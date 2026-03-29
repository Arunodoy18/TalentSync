import "dotenv/config";
import { buildApp } from "./app.js";

const port = Number(process.env.PORT ?? 4000);

async function start() {
  const app = await buildApp();
  await app.listen({ port, host: "0.0.0.0" });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
