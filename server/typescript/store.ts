import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { Bid, Listing } from "./routes";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const listings: Listing[] = JSON.parse(
	readFileSync(join(__dirname, "data", "listings.json"), "utf-8"),
);

export const bids: Bid[] = [];
