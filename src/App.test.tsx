import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import type { ListingsPage } from "./api/listings";
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

	it("shows which page you are on", async () => {
		mockEndpoint({
			url: "/api/listings",
			searchParams: { page: "1", pageSize: "10" },
			body: pageOf([makeListing(1)], { page: 1, pageSize: 10, totalPages: 3 }),
		});

		render(<App />);

		expect(await screen.findByText("Page 1 of 3")).toBeInTheDocument();
	});

	it("loads the next page when Next is clicked", async () => {
		mockEndpoint({
			url: "/api/listings",
			searchParams: { page: "1", pageSize: "10" },
			body: pageOf([makeListing(1)], { page: 1, pageSize: 10, totalPages: 3 }),
		});
		mockEndpoint({
			url: "/api/listings",
			searchParams: { page: "2", pageSize: "10" },
			body: pageOf([makeListing(11)], { page: 2, pageSize: 10, totalPages: 3 }),
		});
		render(<App />);

		await userEvent.click(await screen.findByRole("button", { name: "Next" }));

		expect(await screen.findByText("Plow 11")).toBeInTheDocument();
		expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
	});

	it("loads the first page at the new size when a page size is submitted", async () => {
		mockEndpoint({
			url: "/api/listings",
			searchParams: { page: "1", pageSize: "10" },
			body: pageOf([makeListing(1)], { page: 1, pageSize: 10, totalPages: 3 }),
		});
		mockEndpoint({
			url: "/api/listings",
			searchParams: { page: "2", pageSize: "10" },
			body: pageOf([makeListing(11)], { page: 2, pageSize: 10, totalPages: 3 }),
		});
		mockEndpoint({
			url: "/api/listings",
			searchParams: { page: "1", pageSize: "5" },
			body: pageOf([makeListing(21)], { page: 1, pageSize: 5, totalPages: 8 }),
		});
		render(<App />);
		await userEvent.click(await screen.findByRole("button", { name: "Next" }));
		await screen.findByText("Plow 11");

		await userEvent.clear(screen.getByLabelText("Per page"));
		await userEvent.type(screen.getByLabelText("Per page"), "5");
		await userEvent.click(screen.getByRole("button", { name: "Set" }));

		expect(await screen.findByText("Plow 21")).toBeInTheDocument();
		expect(screen.getByText("Page 1 of 8")).toBeInTheDocument();
	});

	it("jumps to the new last page after a listing is created", async () => {
		mockEndpoint({
			url: "/api/listings",
			searchParams: { page: "1", pageSize: "10" },
			body: pageOf([makeListing(1)], { page: 1, pageSize: 10, totalPages: 1 }),
		});
		mockEndpoint({
			url: "/api/listings",
			searchParams: { page: "2", pageSize: "10" },
			body: pageOf([makeListing(99)], { page: 2, pageSize: 10, totalPages: 2 }),
		});
		mockEndpoint({
			url: "/api/listings",
			method: "post",
			status: 201,
			body: makeListing(99),
		});
		render(<App />);
		await userEvent.click(await screen.findByRole("button", { name: "+ New" }));

		await userEvent.type(screen.getByLabelText("Title"), "Plow 99");
		await userEvent.click(screen.getByRole("button", { name: "Create Listing" }));

		expect(await screen.findByText("Page 2 of 2")).toBeInTheDocument();
		expect(screen.getAllByText("Plow 99").length).toBeGreaterThan(0);
	});

	it("reloads the current page after a listing is created on it", async () => {
		mockEndpoint({
			url: "/api/listings",
			searchParams: { page: "1", pageSize: "10" },
			body: {
				items: [makeListing(1)],
				total: 1,
				page: 1,
				pageSize: 10,
				totalPages: 1,
			},
		});
		mockEndpoint({
			url: "/api/listings",
			method: "post",
			status: 201,
			body: makeListing(99),
		});
		render(<App />);
		await userEvent.click(await screen.findByRole("button", { name: "+ New" }));
		mockEndpoint({
			url: "/api/listings",
			searchParams: { page: "1", pageSize: "10" },
			body: {
				items: [makeListing(1), makeListing(99)],
				total: 2,
				page: 1,
				pageSize: 10,
				totalPages: 1,
			},
		});

		await userEvent.type(screen.getByLabelText("Title"), "Plow 99");
		await userEvent.click(screen.getByRole("button", { name: "Create Listing" }));

		expect((await screen.findAllByText("Plow 99")).length).toBeGreaterThan(0);
	});
});

function pageOf(
	items: Listing[],
	{ page, pageSize, totalPages }: Omit<ListingsPage, "items" | "total">,
): ListingsPage {
	return { items, total: totalPages * pageSize, page, pageSize, totalPages };
}

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
