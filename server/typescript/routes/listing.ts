import type { Request, Response } from "express";
import { listings } from "../store";

export function getListing(req: Request, res: Response): void {
	const listing = listings.find((l) => l.id === req.params.id);

	if (!listing) {
		res.status(404).json({ error: "Listing not found" });
		return;
	}

	res.json(listing);
}
