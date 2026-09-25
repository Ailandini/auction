import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";
import { mockEndpoint } from "./test/mockEndpoint";
import type { Listing } from "./types";

describe("App", () => {
	it("shows the listings from the first page", async () => {
		mockEndpoint({
			url: "/api/listings",
			searchParams: { page: "1", pageSize: "10" },
			body: {
				items: [makeListing(1), makeListing(2)],
				total: 25,
				page: 1,
				pageSize: 10,
				totalPages: 3,
			},
		});

		render(<App />);

		expect(await screen.findByText("Plow 1")).toBeInTheDocument();
		expect(screen.getByText("Plow 2")).toBeInTheDocument();
	});
});

function makeListing(n: number): Listing {
	return {
		id: `listing-${n}`,
		title: `Plow ${n}`,
		description: "",
		category: "implement",
		startingPrice: 1000,
		currentBid: 1000,
		currentBidder: null,
		status: "active",
		endsAt: "2030-01-01T00:00:00.000Z",
		imageUrl: "",
	};
}
