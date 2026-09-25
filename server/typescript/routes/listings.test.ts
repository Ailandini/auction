import type { Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { listings } from "../store";
import { createListing, getListings } from "./listings";

describe("GET /api/listings", () => {
	it("responds with every listing in the store", () => {
		const res = createResponse();

		getListings({} as Request, res);

		expect(res.json).toHaveBeenCalledWith(listings);
	});
});

describe("POST /api/listings", () => {
	afterEach(() => vi.useRealTimers());

	it("rejects a request with no title", () => {
		const res = createResponse();

		createListing({ body: {} } as Request, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: "Title is required" });
	});

	it("rejects a title that is only whitespace", () => {
		const res = createResponse();

		createListing({ body: { title: "   " } } as Request, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: "Title is required" });
	});

	it("rejects a title that is not a string", () => {
		const res = createResponse();

		createListing({ body: { title: 123 } } as Request, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: "Title is required" });
	});

	it("responds 201 with the new listing and a trimmed title", () => {
		const res = createResponse();

		createListing({ body: { title: "  Old Plow  " } } as Request, res);

		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({ title: "Old Plow" }),
		);
	});

	it("fills every other field with a default", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
		const res = createResponse();

		createListing({ body: { title: "Old Plow" } } as Request, res);

		expect(res.json).toHaveBeenCalledWith({
			id: expect.any(String),
			title: "Old Plow",
			description: "",
			category: "implement",
			startingPrice: 0,
			currentBid: 0,
			currentBidder: null,
			status: "active",
			endsAt: "2026-01-08T00:00:00.000Z",
			imageUrl: "",
		});
	});

	it("adds the new listing to the store", () => {
		const countBefore = listings.length;

		createListing({ body: { title: "Old Plow" } } as Request, createResponse());

		expect(listings).toHaveLength(countBefore + 1);
		expect(listings.at(-1)?.title).toBe("Old Plow");
	});
});

function createResponse() {
	return {
		json: vi.fn(),
		status: vi.fn().mockReturnThis(),
	} as unknown as Response;
}
