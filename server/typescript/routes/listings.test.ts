import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { listings } from "../store";
import { getListings } from "./listings";

describe("GET /api/listings", () => {
	it("responds with every listing in the store", () => {
		const res = createResponse();

		getListings({} as Request, res);

		expect(res.json).toHaveBeenCalledWith(listings);
	});
});

function createResponse() {
	return { json: vi.fn() } as unknown as Response;
}
