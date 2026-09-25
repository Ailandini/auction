import type { Response } from "express";
import { vi } from "vitest";

export function createResponse() {
	return {
		json: vi.fn(),
		status: vi.fn().mockReturnThis(),
	} as unknown as Response;
}
