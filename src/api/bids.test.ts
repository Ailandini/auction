import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { mockEndpoint } from "../test/mockEndpoint";
import { server } from "../test/server";
import type { Listing } from "../types";
import { getBids, placeBid } from "./bids";

const listing: Listing = {
	id: "listing-1",
	title: "Old Plow",
	description: "",
	category: "implement",
	startingPrice: 1000,
	currentBid: 2000,
	currentBidder: "Sam",
	status: "active",
	endsAt: "2030-01-01T00:00:00.000Z",
	imageUrl: "",
};

describe("getBids", () => {
	it("returns the bid history for the listing", async () => {
		const bid = {
			listingId: "listing-1",
			bidder: "Sam",
			amount: 2000,
			placedAt: "2026-09-25T04:10:07.289Z",
		};
		mockEndpoint({ url: "/api/listings/listing-1/bids", body: [bid] });

		const result = await getBids("listing-1");

		expect(result).toEqual([bid]);
	});

	it("throws when the bid history cannot be loaded", async () => {
		mockEndpoint({
			url: "/api/listings/listing-1/bids",
			status: 404,
			body: { error: "Listing not found" },
		});

		await expect(getBids("listing-1")).rejects.toThrow(
			"Failed to fetch bids",
		);
	});
});

describe("placeBid", () => {
	it("posts the bid and returns the updated listing", async () => {
		mockEndpoint({
			url: "/api/listings/listing-1/bids",
			method: "post",
			status: 201,
			body: listing,
		});

		const result = await placeBid("listing-1", "Sam", 2000);

		expect(result).toEqual(listing);
	});

	it("throws the server's error message when the bid is rejected", async () => {
		mockEndpoint({
			url: "/api/listings/listing-1/bids",
			method: "post",
			status: 400,
			body: { error: "Bid must be greater than the current bid of $2,000" },
		});

		await expect(placeBid("listing-1", "Sam", 1500)).rejects.toThrow(
			"Bid must be greater than the current bid of $2,000",
		);
	});

	it("falls back to the detail field for the error message", async () => {
		mockEndpoint({
			url: "/api/listings/listing-1/bids",
			method: "post",
			status: 422,
			body: { detail: "Listing is closed" },
		});

		await expect(placeBid("listing-1", "Sam", 2500)).rejects.toThrow(
			"Listing is closed",
		);
	});

	it("uses a generic message when the error response has no message", async () => {
		mockEndpoint({
			url: "/api/listings/listing-1/bids",
			method: "post",
			status: 500,
			body: {},
		});

		await expect(placeBid("listing-1", "Sam", 2500)).rejects.toThrow(
			"Failed to place bid",
		);
	});

	it("uses a generic message when the error response is not JSON", async () => {
		server.use(
			http.post(
				"/api/listings/listing-1/bids",
				() => new HttpResponse("Bad Gateway", { status: 502 }),
			),
		);

		await expect(placeBid("listing-1", "Sam", 2500)).rejects.toThrow(
			"Failed to place bid",
		);
	});
});
