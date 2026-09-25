import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pager, type PagerProps } from "./Pager";

describe("Pager", () => {
	it("shows the current page and the total number of pages", () => {
		renderPager({ page: 2, totalPages: 4 });

		expect(screen.getByText("Page 2 of 4")).toBeInTheDocument();
	});

	it("goes to the next page when Next is clicked", async () => {
		const { onPageChange } = renderPager({ page: 2, totalPages: 4 });

		await userEvent.click(screen.getByRole("button", { name: "Next" }));

		expect(onPageChange).toHaveBeenCalledWith(3);
	});

	it("goes to the previous page when Previous is clicked", async () => {
		const { onPageChange } = renderPager({ page: 2, totalPages: 4 });

		await userEvent.click(screen.getByRole("button", { name: "Previous" }));

		expect(onPageChange).toHaveBeenCalledWith(1);
	});

	it("disables Previous on the first page", () => {
		renderPager({ page: 1, totalPages: 4 });

		expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
	});

	it("disables Next on the last page", () => {
		renderPager({ page: 4, totalPages: 4 });

		expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
	});

	it("shows the current page size in the page size input", () => {
		renderPager({ pageSize: 15 });

		expect(screen.getByLabelText("Per page")).toHaveValue(15);
	});

	it("submits the entered page size as a number", async () => {
		const { onPageSizeSubmit } = renderPager({ pageSize: 10 });

		await userEvent.clear(screen.getByLabelText("Per page"));
		await userEvent.type(screen.getByLabelText("Per page"), "15");
		await userEvent.click(screen.getByRole("button", { name: "Set" }));

		expect(onPageSizeSubmit).toHaveBeenCalledWith(15);
	});

	it.each([
		"0",
		"101",
		"2.5",
	])("shows an error and does not submit the page size %j", async (value) => {
		const { onPageSizeSubmit } = renderPager({ pageSize: 10 });

		await userEvent.clear(screen.getByLabelText("Per page"));
		await userEvent.type(screen.getByLabelText("Per page"), value);
		await userEvent.click(screen.getByRole("button", { name: "Set" }));

		expect(
			screen.getByText("Enter a whole number from 1 to 100"),
		).toBeInTheDocument();
		expect(onPageSizeSubmit).not.toHaveBeenCalled();
	});
});

function renderPager(props: Partial<PagerProps> = {}) {
	const handlers = { onPageChange: vi.fn(), onPageSizeSubmit: vi.fn() };
	render(
		<Pager page={1} totalPages={4} pageSize={10} {...handlers} {...props} />,
	);
	return handlers;
}
