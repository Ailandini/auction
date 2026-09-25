import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { mockEndpoint } from "../test/mockEndpoint";
import type { Listing } from "../types";
import BidForm from "./BidForm";

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

describe("BidForm", () => {
	it("clears the form after a successful bid", async () => {
		mockEndpoint({
			url: "/api/listings/listing-1/bids",
			method: "post",
			body: { ...listing, currentBid: 2000, currentBidder: "Sam" },
		});
		const user = userEvent.setup();
		render(<BidForm listing={listing} onBidSuccess={vi.fn()} />);

		await user.type(screen.getByLabelText("Your Name"), "Sam");
		await user.type(screen.getByLabelText(/Bid Amount/), "2000");
		await user.click(screen.getByRole("button", { name: "Submit Bid" }));

		await waitFor(() =>
			expect(screen.getByLabelText("Your Name")).toHaveValue(""),
		);
	});
});
