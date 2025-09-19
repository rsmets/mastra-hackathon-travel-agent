import { createTool } from "@mastra/core/tools";
import { ApifyClient } from "apify-client";
import z from "zod";

// Initialize the ApifyClient with API token
const client = new ApifyClient({
  token: process.env.APIFY_API_KEY,
});

// Extremely verbose inline comments:
// Define a reusable schema for the hotel item output that mirrors common fields
// returned by the Apify actor (jupri/expedia-hotels). We mark most fields as
// optional/nullable because different listings may omit them. `.passthrough()`
// ensures we keep any additional vendor-specific fields without validation errors.
const HotelOutputItemSchema = z
  .object({
    url: z.string(),
    name: z.string(),
    address: z.string().optional(),
    rating: z.number().nullable().optional(),
    reviews: z.number().int().nullable().optional(),
    stars: z.number().int().nullable().optional(),
    price: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    roomType: z.string().nullable().optional(),
    persons: z.number().int().nullable().optional(),
    image: z.string().nullable().optional(),
  })
  .passthrough();

async function getHotels(locations: string[], limit?: number) {
  // Prepare Actor input
  const input = {
    location: locations,
    limit: limit ?? 5,
  };

  // Run the Actor and wait for it to finish
  const run = await client.actor("pK2iIKVVxERtpwXMy").call(input);

  // Fetch and print Actor results from the run's dataset (if any)
  console.log("Results from dataset");
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  items.forEach((item) => {
    console.dir(item);
  });

  // Extremely verbose inline comments:
  // Step 1: Attempt to strictly validate the raw items against our schema.
  // If all items already conform, we simply return them and satisfy the type
  // contract required by the tool's outputSchema.
  const parsed = z.array(HotelOutputItemSchema).safeParse(items as unknown[]);
  if (parsed.success) {
    return parsed.data;
  }

  // Step 2: If strict validation fails, we coerce each item into the expected
  // structure. We preserve unknown properties by spreading the original object.
  const coerced = (items as unknown[]).map((raw) => {
    const it = (raw || {}) as Record<string, unknown>;
    const url = typeof it.url === "string" ? it.url : "";
    const name = typeof it.name === "string" ? it.name : "";
    const address = typeof it.address === "string" ? it.address : undefined;
    const rating = typeof it.rating === "number" ? it.rating : null;
    const reviews = typeof it.reviews === "number" ? it.reviews : null;
    const stars = typeof it.stars === "number" ? it.stars : null;
    const price = typeof it.price === "number" ? it.price : null;
    const currency = typeof it.currency === "string" ? it.currency : null;
    const roomType = typeof it.roomType === "string" ? it.roomType : null;
    const persons = typeof it.persons === "number" ? it.persons : null;
    const image = typeof it.image === "string" ? it.image : null;

    return {
      ...it,
      url,
      name,
      address,
      rating,
      reviews,
      stars,
      price,
      currency,
      roomType,
      persons,
      image,
    };
  });

  // Step 3: Re-validate coerced results; if still invalid, drop records missing required fields.
  const finalParsed = z.array(HotelOutputItemSchema).safeParse(coerced);
  if (finalParsed.success) {
    return finalParsed.data;
  }
  const filtered = coerced.filter(
    (h) => Boolean((h as any).url) && Boolean((h as any).name),
  );
  return filtered as Array<z.infer<typeof HotelOutputItemSchema>>;
}

export const hotelSearchTool = createTool({
  id: "get-hotels",
  description: "Get hotels for a location",
  inputSchema: z.object({
    location: z
      .array(z.string())
      .describe(
        "Location array as per Apify: city/region name, region ID (region:6047843), coordinates (lat,lon), or Expedia hotel IDs",
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe("Number of results (per-query)"),
  }),
  outputSchema: z.object({
    hotels: z.array(HotelOutputItemSchema),
  }),
  execute: async ({ context }) => {
    return {
      hotels: await getHotels(
        context.location as string[],
        context.limit as number | undefined,
      ),
    };
  },
});
