import type { Request } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { listings } from "../store";
import { createResponse } from "./createResponse";
import { createListing, getListings } from "./listings";

describe("GET /api/listings", () => {
	it("responds with the first page of 10 listings by default", () => {
		const res = createResponse();

		getListings({ query: {} } as Request, res);

		expect(res.json).toHaveBeenCalledWith({
			items: listings.slice(0, 10),
			total: listings.length,
			page: 1,
			pageSize: 10,
			totalPages: Math.ceil(listings.length / 10),
		});
	});

	it("responds with the requested page", () => {
		const res = createResponse();

		getListings({ query: { page: "2" } } as unknown as Request, res);

		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({ items: listings.slice(10, 20), page: 2 }),
		);
	});

	it("responds with the requested page size", () => {
		const res = createResponse();

		getListings({ query: { pageSize: "15" } } as unknown as Request, res);

		expect(res.json).toHaveBeenCalledWith({
			items: listings.slice(0, 15),
			total: listings.length,
			page: 1,
			pageSize: 15,
			totalPages: Math.ceil(listings.length / 15),
		});
	});

	it.each(["0", "-1", "abc", "1.5", ""])(
		"rejects the page %j",
		(page) => {
			const res = createResponse();

			getListings({ query: { page } } as unknown as Request, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				error: "page must be a whole number of at least 1",
			});
		},
	);

	it.each(["0", "-5", "abc", "2.5", "", "101"])(
		"rejects the pageSize %j",
		(pageSize) => {
			const res = createResponse();

			getListings({ query: { pageSize } } as unknown as Request, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				error: "pageSize must be a whole number from 1 to 100",
			});
		},
	);

	it("accepts the largest allowed pageSize", () => {
		const res = createResponse();

		getListings({ query: { pageSize: "100" } } as unknown as Request, res);

		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({ pageSize: 100 }),
		);
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
