import type { Listing } from "../types";

export async function placeBid(
	listingId: string,
	bidder: string,
	amount: number,
): Promise<Listing> {
	const res = await fetch(`/api/listings/${listingId}/bids`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ bidder, amount }),
	});
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.error || data.detail || "Failed to place bid");
	}
	return res.json();
}
