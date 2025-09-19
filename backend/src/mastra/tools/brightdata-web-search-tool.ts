import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const WebSearchResultSchema = z.object({
  title: z.string().describe("The title of the search result."),
  link: z.string().describe("The URL of the search result."),
  snippet: z.string().describe("A brief description of the search result."),
  position: z.number().describe("The ranking position of the search result."),
});

async function getWebSearch(query: string) {
  try {
    const response = await fetch("https://api.brightdata.com/request", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BRIGHTDATA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        zone: "serp_api1",
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        format: "json",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Bright Data API error:", errorText);
      throw new Error(
        `Bright Data API request failed with status ${response.status}`,
      );
    }

    const data = await response.json();
    console.log("📊 Response data:", JSON.stringify(data, null, 2));

    if (!data.organic) {
      console.warn("⚠️ No organic results found in the response.");
      return [];
    }

    // Extremely verbose inline comments:
    // Map over the organic results from the Bright Data SERP API response.
    // For each result, we extract the title, link, snippet, and position.
    // We provide default values for each field to prevent errors if a field is missing.
    // This ensures that our application can gracefully handle incomplete data from the API.
    return data.organic.map((item: any) => ({
      title: item.title || "No title",
      link: item.link || "#",
      snippet: item.snippet || "No snippet",
      position: item.position || 0,
    }));
  } catch (error) {
    console.error("❌ Error in getWebSearch:", (error as Error).message);
    // Extremely verbose inline comments:
    // In case of an error during the API call or data processing, we return an empty array.
    // This ensures that the tool always returns a value that matches the expected output schema,
    // preventing downstream errors in the agent.
    return [];
  }
}

export const brightdataWebSearchTool = createTool({
  id: "brightdata-web-search",
  description:
    "Performs a web search using the Bright Data SERP API for Google.",
  inputSchema: z.object({
    query: z
      .string()
      // Extremely verbose inline comments:
      // We first remove leading/trailing whitespace to avoid accidental spaces at the ends
      // which would otherwise cause a valid single-token query to be rejected erroneously.
      .trim()
      // We explicitly require that, after trimming, the query is non-empty.
      .min(1, "Query cannot be empty after trimming.")
      // We enforce that the query is a single token by prohibiting ANY whitespace characters.
      // The regex /^\S+$/ matches one or more non-whitespace characters from start to end.
      .regex(/^\S+$/, "Query must be a single token with no spaces.")
      .describe(
        "The search query to look up. Only one word is allowed - please remove all spaces.",
      ),
  }),
  outputSchema: z.object({
    results: z
      .array(WebSearchResultSchema)
      .describe("An array of web search results."),
  }),
  execute: async ({ context }) => {
    // Extremely verbose inline comments:
    // The execute function is the entry point for the Mastra tool.
    // It receives the input context, which contains the query provided by the user or agent.
    // Because of the input schema, `context.query` is guaranteed to be a single token without spaces.
    // We then call our core logic function `getWebSearch` with the validated query.
    const searchResults = await getWebSearch(context.query);
    // Extremely verbose inline comments:
    // The result of the `getWebSearch` function is then wrapped in an object
    // that matches the structure of the `outputSchema` and returned.
    return {
      results: searchResults,
    };
  },
});
