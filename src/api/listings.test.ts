import { describe, expect, it } from "vitest";
import { mockEndpoint } from "../test/mockEndpoint";
import type { Listing } from "../types";
import { getListings } from "./listings";

const listing: Listing = {
	id: "listing-1",
	title: "Old Plow",
	description: "",
	category: "implement",
	startingPrice: 1000,
	currentBid: 1500,
	currentBidder: null,
	status: "active",
	endsAt: "2030-01-01T00:00:00.000Z",
	imageUrl: "",
};

describe("getListings", () => {
	it("requests the given page and page size", async () => {
		const page = { items: [listing], total: 11, page: 2, pageSize: 5, totalPages: 3 };
		mockEndpoint({
			url: "/api/listings",
			searchParams: { page: "2", pageSize: "5" },
			body: page,
		});

		const result = await getListings(2, 5);

		expect(result).toEqual(page);
	});
});
