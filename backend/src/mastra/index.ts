import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { weatherWorkflow } from "./workflows/weather-workflow";
import { travelAgent } from "./agents/travelAgent";
import { webSummarizationAgent } from "./agents/webSummarizationAgent";

const ENV = process.env.NODE_ENV || "development";

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { travelAgent, webSummarizationAgent },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  server: {
    // Disable CORS for development
    cors:
      ENV === "development"
        ? {
            origin: "*",
            allowMethods: ["*"],
            allowHeaders: ["*"],
          }
        : undefined,
  },
});
