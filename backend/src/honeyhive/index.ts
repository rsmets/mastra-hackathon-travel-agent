import {
  HoneyHiveTracer,
  enrichSession,
  enrichSpan,
  traceFunction,
} from "honeyhive";

// Initialize a session
await HoneyHiveTracer.init({
  apiKey: process.env.HONEYHIVE_API_KEY,
  project: "Travel Agent",
  //   source: MY_SOURCE, // Optional
  //   sessionName: MY_SESSION_NAME, // Optional
  //   serverUrl: MY_HONEYHIVE_SERVER_URL, // Optional / Required for self-hosted or dedicated deployments
});

// // Make sure to await the trace call when using async functions
// await tracer.trace(async () => {
//   // Your AI pipeline code here

//   // Note: Auto-instrumentation is only supported for CommonJS implementations
//   // Note: For ESModules implementations, please refer to Step 3 below

//   // Your async AI pipeline code here
//   const result = await someAsyncFunction();
//   // ... more async code ...
// });

// Instantiate a new tracer object with HoneyHiveTracer.init() to trace a new session
export { enrichSession, enrichSpan, traceFunction };
