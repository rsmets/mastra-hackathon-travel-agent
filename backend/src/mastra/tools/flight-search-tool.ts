import { createTool } from "@mastra/core/tools";
import { ApifyClient } from "apify-client";
import z from "zod";

// Initialize the ApifyClient with API token
const client = new ApifyClient({
  token: process.env.APIFY_API_KEY,
});

// Extremely verbose inline comments:
// Define a reusable schema for the flight item output. This is based on typical
// fields returned by flight scraping actors. We mark most fields as optional/nullable
// because different flight listings may omit certain details. `.passthrough()`
// ensures we keep any additional vendor-specific fields without validation errors.
const AirlineSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  logoUrl: z.string().url().optional(),
});

const AirportInfoSchema = z.object({
  code: z.string().optional(),
  cityName: z.string().optional(),
  displayName: z.string().optional(),
});

const ArrivalDepartureInfoSchema = z.object({
  airport: AirportInfoSchema.optional(),
  isoDateTimeLocal: z.string().optional(),
});

const SegmentSchema = z.object({
  airline: AirlineSchema.optional(),
  arrival: ArrivalDepartureInfoSchema.optional(),
  departure: ArrivalDepartureInfoSchema.optional(),
  durationMinutes: z.number().optional(),
  flightNumber: z.string().optional(),
});

const LegSchema = z.object({
  legDurationDisplay: z.string().optional(),
  legDurationMinutes: z.number().optional(),
  segments: z.array(SegmentSchema).optional(),
});

const FlightOutputItemSchema = z
  .object({
    url: z.string(),
    displayAirline: AirlineSchema.optional(),
    legs: z.array(LegSchema).optional(),
    // The main price shown for the flight.
    price: z.string().optional(),
    // The provider for the main price (e.g., Kiwi.com, Orbitz).
    provider: z.string().optional(),
  })
  .passthrough();

const FlightSearchInputSchema = z.object({
  origin: z.string().describe("Origin airport code (e.g., SFO) or city."),
  destination: z
    .string()
    .describe("Destination airport code (e.g., JFK) or city."),
  departureDate: z.string().describe("Departure date in YYYY-MM-DD format."),
  returnDate: z
    .string()
    .optional()
    .describe("Return date in YYYY-MM-DD format for round trips."),
  limit: z
    .number()
    .int()
    .optional()
    .default(10)
    .describe("Number of results to return."),
  currency: z
    .string()
    .optional()
    .default("USD")
    .describe("Currency for prices."),
  sort: z
    .enum([
      "best",
      "earliest_depart",
      "latest_depart",
      "earliest_arrive",
      "latest_arrive",
      "high_price",
      "low_price",
      "slowest",
      "quickest",
    ])
    .optional()
    .default("best"),
  nonStop: z.boolean().optional(),
  oneStop: z.boolean().optional(),
  twoPlusStops: z.boolean().optional(),
  adults: z.number().int().optional().default(1),
});

async function getFlights(input: z.infer<typeof FlightSearchInputSchema>) {
  // Extremely verbose inline comments:
  // We are constructing the input for the Apify actor. The actor from the
  // OpenAPI schema (`jupri~kayak-flights`) expects keys with dot notation
  // like "origin.0" and "filters.non_stop". We map our user-friendly
  // schema to this format.
  const actorInput: Record<string, any> = {
    "origin.0": input.origin,
    "target.0": input.destination,
    "depart.0": input.departureDate,
    limit: input.limit,
    currency: input.currency,
    sort: input.sort,
    "filters.adults": input.adults,
  };

  // Extremely verbose inline comments:
  // If a return date is provided, we configure the second leg of the flight search.
  // For a round trip, the origin and destination are swapped for the return flight.
  if (input.returnDate) {
    actorInput["origin.1"] = input.destination;
    actorInput["target.1"] = input.origin;
    actorInput["depart.1"] = input.returnDate;
  }

  // Extremely verbose inline comments:
  // We add filters to the actor input only if they are defined in our tool input.
  // This avoids sending `undefined` values which might confuse the actor.
  if (input.nonStop !== undefined)
    actorInput["filters.non_stop"] = input.nonStop;
  if (input.oneStop !== undefined)
    actorInput["filters.one_stop"] = input.oneStop;
  if (input.twoPlusStops !== undefined)
    actorInput["filters.two_stop"] = input.twoPlusStops;

  // Run the Actor and wait for it to finish. The actor name is taken from the OpenAPI schema.
  const run = await client.actor("jupri~kayak-flights").call(actorInput);

  // Fetch Actor results from the run's dataset.
  console.log("Results from dataset");
  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  // Extremely verbose inline comments:
  // We will now attempt to parse and validate the results from Apify.
  // Scraping results can be unpredictable, so we use `safeParse` and have
  // a fallback to ensure the data conforms to our `FlightOutputItemSchema`.
  const parsed = z.array(FlightOutputItemSchema).safeParse(items as unknown[]);
  if (parsed.success) {
    return parsed.data;
  }

  // Extremely verbose inline comments:
  // If strict validation fails, we coerce each item into the expected structure.
  // This handles cases where fields might have the wrong type or be missing.
  // We preserve unknown properties by spreading the original object.
  const coerced = (items as unknown[]).map((raw) => {
    const it = (raw || {}) as Record<string, any>;
    const priceInfo = it.optionsByFare?.[0]?.options?.[0];

    return {
      ...it,
      url: typeof it.url === "string" ? it.url : "",
      displayAirline: it.displayAirline,
      legs: it.legs,
      price: priceInfo?.displayPrice,
      provider: priceInfo?.providerInfo?.displayName,
    };
  });

  // Extremely verbose inline comments:
  // We try parsing again. If it still fails, we filter out items that are missing
  // the 'url' as a last resort to return at least some valid data.
  const finalParsed = z.array(FlightOutputItemSchema).safeParse(coerced);
  if (finalParsed.success) {
    return finalParsed.data;
  }

  const filtered = coerced.filter((f) => Boolean(f.url));
  return filtered as Array<z.infer<typeof FlightOutputItemSchema>>;
}

export const flightSearchTool = createTool({
  id: "get-flights",
  description:
    "Get flights for a start and end location, with an optional date.",
  inputSchema: FlightSearchInputSchema,
  outputSchema: z.object({
    flights: z.array(FlightOutputItemSchema),
  }),
  execute: async ({ context }) => {
    // Extremely verbose inline comments:
    // The execute function is the entry point for the tool. It receives the
    // context with validated input, calls our `getFlights` function,
    // and returns the results in the shape defined by `outputSchema`.
    const flights = await getFlights(context);
    return {
      flights,
    };
  },
});
