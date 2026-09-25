import { describe, expect, it } from "vitest";
import { mockEndpoint } from "./mockEndpoint";

describe("mockEndpoint", () => {
	it("responds to a GET with the given body", async () => {
		mockEndpoint({ url: "/api/things", body: { name: "thing" } });

		const res = await fetch("/api/things");

		expect(await res.json()).toEqual({ name: "thing" });
	});
});
