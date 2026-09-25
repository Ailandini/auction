import { type SubmitEvent, useState } from "react";

export interface PagerProps {
	page: number;
	totalPages: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	onPageSizeSubmit: (pageSize: number) => void;
}

const MAX_PAGE_SIZE = 100;

export function Pager({
	page,
	totalPages,
	pageSize,
	onPageChange,
	onPageSizeSubmit,
}: PagerProps) {
	const [sizeError, setSizeError] = useState<string | null>(null);

	return (
    <nav className="pager">
      <span className="pager__nav">
  			<button
  				type="button"
  				disabled={page <= 1}
  				onClick={() => onPageChange(page - 1)}
  			>
  				Previous
  			</button>
  			<span className="pager__status">
  				Page {page} of {totalPages}
  			</span>
   			<button
    				type="button"
    				disabled={page >= totalPages}
    				onClick={() => onPageChange(page + 1)}
   			>
          Next
        </button>
      </span>
			<form className="pager__size" onSubmit={handleSizeSubmit} noValidate>
				<label htmlFor="page-size">Per page</label>
				<input
					id="page-size"
					name="pageSize"
					type="number"
					defaultValue={pageSize}
				/>
				<button type="submit">Set</button>
				{sizeError && <div className="pager__error">{sizeError}</div>}
			</form>
		</nav>
	);

	function handleSizeSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const size = Number(data.get("pageSize"));

		if (!Number.isInteger(size) || size < 1 || size > MAX_PAGE_SIZE) {
			setSizeError(`Enter a whole number from 1 to ${MAX_PAGE_SIZE}`);
			return;
		}

		setSizeError(null);
		onPageSizeSubmit(size);
	}
}
