import { randomUUID } from "node:crypto";
import type { Request } from "express";
import { describe, expect, it } from "vitest";
import { listings } from "../store";
import { type BidRequest, placeBid } from "./bids";
import { createResponse } from "./createResponse";
import type { Listing } from "./listings";

describe("POST /api/listings/:id/bids", () => {
	it("responds 404 when no listing has that id", () => {
		const res = createResponse();

		placeBid(bidRequest("missing", { bidder: "Sam", amount: 100 }), res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({ error: "Listing not found" });
	});

	it("rejects a bid on a listing that is not active", () => {
		const res = createResponse();
		const listing = addListing({ status: "closed" });

		placeBid(bidRequest(listing.id, { bidder: "Sam", amount: 500 }), res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			error: "This listing is not currently active",
		});
	});

	it("rejects a bid with no bidder name", () => {
		const res = createResponse();
		const listing = addListing();

		placeBid(bidRequest(listing.id, { amount: 500 }), res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: "Bidder name is required" });
	});

	it("rejects a bidder name that is only whitespace", () => {
		const res = createResponse();
		const listing = addListing();

		placeBid(bidRequest(listing.id, { bidder: "   ", amount: 500 }), res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: "Bidder name is required" });
	});

	it("rejects a bidder name that is not a string", () => {
		const res = createResponse();
		const listing = addListing();
		const bidderAsNumber = 42 as unknown as string;

		placeBid(bidRequest(listing.id, { bidder: bidderAsNumber, amount: 500 }), res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ error: "Bidder name is required" });
	});

	it("rejects a bid with no amount", () => {
		const res = createResponse();
		const listing = addListing();

		placeBid(bidRequest(listing.id, { bidder: "Sam" }), res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			error: "Bid amount must be a positive number",
		});
	});

	it("rejects a bid amount that is NaN", () => {
		const res = createResponse();
		const listing = addListing();

		placeBid(bidRequest(listing.id, { bidder: "Sam", amount: Number.NaN }), res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			error: "Bid amount must be a positive number",
		});
	});

	it("rejects a bid amount of zero or less", () => {
		const res = createResponse();
		const listing = addListing();

		placeBid(bidRequest(listing.id, { bidder: "Sam", amount: 0 }), res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			error: "Bid amount must be a positive number",
		});
	});

	it("rejects a bid that does not beat the current bid", () => {
		const res = createResponse();
		const listing = addListing({ currentBid: 1500 });

		placeBid(bidRequest(listing.id, { bidder: "Sam", amount: 1500 }), res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			error: `Bid must be greater than the current bid of $${(1500).toLocaleString()}`,
		});
	});

	it("records a winning bid and the trimmed bidder on the listing", () => {
		const listing = addListing({ currentBid: 1500 });

		placeBid(
			bidRequest(listing.id, { bidder: "  Sam  ", amount: 1600 }),
			createResponse(),
		);

		expect(listing.currentBid).toBe(1600);
		expect(listing.currentBidder).toBe("Sam");
	});

	it("responds 201 with the updated listing", () => {
		const res = createResponse();
		const listing = addListing({ currentBid: 1500 });

		placeBid(bidRequest(listing.id, { bidder: "Sam", amount: 1600 }), res);

		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith(listing);
	});
});

function bidRequest(id: string, body: Partial<BidRequest>) {
	return { params: { id }, body } as unknown as Request;
}

function addListing(overrides: Partial<Listing> = {}): Listing {
	const listing: Listing = {
		id: randomUUID(),
		title: "Test Plow",
		description: "",
		category: "implement",
		startingPrice: 100,
		currentBid: 100,
		currentBidder: null,
		status: "active",
		endsAt: "2030-01-01T00:00:00.000Z",
		imageUrl: "",
		...overrides,
	};
	listings.push(listing);
	return listing;
}
