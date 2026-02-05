// Your TypeScript code goes here

import app from "./app.js";
import { logger } from "./config/logger.js";

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  logger.info(
    {
      port,
      url: `http://localhost:${port}/api/tasks`,
    },
    "server.started",
  );
});
