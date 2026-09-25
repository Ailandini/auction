import type { Request, Response } from "express";
import { listings } from "../store";

export interface BidRequest {
	bidder: string;
	amount: number;
}

export function placeBid(req: Request, res: Response): void {
	const listing = listings.find((l) => l.id === req.params.id);

	if (!listing) {
		res.status(404).json({ error: "Listing not found" });
		return;
	}

	if (listing.status !== "active") {
		res.status(400).json({ error: "This listing is not currently active" });
		return;
	}

	const bid = req.body as BidRequest;

	if (!bid.bidder || typeof bid.bidder !== "string" || bid.bidder.trim() === "") {
		res.status(400).json({ error: "Bidder name is required" });
		return;
	}

	if (
		typeof bid.amount !== "number" ||
		Number.isNaN(bid.amount) ||
		bid.amount <= 0
	) {
		res.status(400).json({ error: "Bid amount must be a positive number" });
		return;
	}

	if (bid.amount >= listing.currentBid) {
		res.status(400).json({
			error: `Bid must be greater than the current bid of $${listing.currentBid.toLocaleString()}`,
		});
		return;
	}

	listing.currentBid = bid.amount;
	listing.currentBidder = bid.bidder.trim();

	res.status(201).json(listing);
}
