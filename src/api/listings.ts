import type { Listing } from "../types";

export interface ListingsPage {
	items: Listing[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export async function getListings(
	page = 1,
	pageSize = 10,
): Promise<ListingsPage> {
	const query = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize),
	});
	const res = await fetch(`/api/listings?${query}`);
	if (!res.ok) throw new Error("Failed to fetch listings");
	return res.json();
}

export async function getListing(id: string): Promise<Listing> {
	const res = await fetch(`/api/listings/${id}`);
	if (!res.ok) throw new Error("Failed to fetch listing");
	return res.json();
}

export async function createListing(data: { title: string }): Promise<Listing> {
	const res = await fetch("/api/listings", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error || body.detail || "Failed to create listing");
	}
	return res.json();
}
