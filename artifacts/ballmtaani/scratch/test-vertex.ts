import { answerMchambuzi } from "../api/_mchambuzi-core";
import { loadEnv } from "../api/_env-loader";

// Load environment variables manually via the project's own helper
loadEnv();

async function runTest() {
  console.log("Running local Vertex AI integration test for Mchambuzi...");
  console.log("Using Provider Preference: vertexai-only");
  
  try {
    const result = await answerMchambuzi(
      "Will Morocco win the 2026 World Cup?",
      process.env,
      { debug: true, providerPreference: "vertexai-only" }
    );
    
    console.log("\n--- TEST RESULT ---");
    console.log("Status: Success");
    console.log("Provider Used:", result.provider);
    console.log("Attempted Providers:", result.attemptedProviders);
    console.log("Diagnostics Log:", result.diagnostics);
    console.log("Answer Content:\n", result.answer);
    console.log("-------------------");
  } catch (error) {
    console.error("\n--- TEST FAILED ---");
    console.error(error);
  }
}

runTest();
