import type { Request } from "express";
import { describe, expect, it } from "vitest";
import { listings } from "../store";
import { createResponse } from "./createResponse";
import { getListing } from "./listing";

describe("GET /api/listings/:id", () => {
	it("responds 404 when no listing has that id", () => {
		const res = createResponse();

		getListing({ params: { id: "missing" } } as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ error: "Listing not found" });
	});

	it("responds with the listing that has that id", () => {
		const res = createResponse();
		const [firstListing] = listings;

		getListing({ params: { id: firstListing.id } } as unknown as Request, res);

		expect(res.json).toHaveBeenCalledWith(firstListing);
	});
});
