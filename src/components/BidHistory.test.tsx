import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mockEndpoint } from "../test/mockEndpoint";
import { BidHistory } from "./BidHistory";

describe("BidHistory", () => {
	it("says there are no bids when the listing has none", async () => {
		mockEndpoint({ url: "/api/listings/listing-1/bids", body: [] });

		render(<BidHistory listingId="listing-1" currentBid={1000} />);

		expect(await screen.findByText("No bids yet.")).toBeInTheDocument();
	});

	it("lists each bid with its bidder and amount, in the order given", async () => {
		mockEndpoint({
			url: "/api/listings/listing-1/bids",
			body: [
				bid("Cy", 2100),
				bid("Ann", 2000),
			],
		});

		render(<BidHistory listingId="listing-1" currentBid={2100} />);

		const items = await screen.findAllByRole("listitem");
		expect(items).toHaveLength(2);
		expect(items[0]).toHaveTextContent("Cy");
		expect(items[0]).toHaveTextContent("$2,100");
		expect(items[1]).toHaveTextContent("Ann");
		expect(items[1]).toHaveTextContent("$2,000");
	});
});

describe("BidHistory errors", () => {
	it("says so when the bid history cannot be loaded", async () => {
		mockEndpoint({
			url: "/api/listings/listing-1/bids",
			status: 404,
			body: { error: "Listing not found" },
		});

		render(<BidHistory listingId="listing-1" currentBid={1000} />);

		expect(
			await screen.findByText("Could not load bid history."),
		).toBeInTheDocument();
	});
});

function bid(bidder: string, amount: number) {
	return {
		listingId: "listing-1",
		bidder,
		amount,
		placedAt: "2026-09-25T04:10:07.289Z",
	};
}
