import { useEffect, useState } from "react";
import { type Bid, getBids } from "../api/bids";

export interface BidHistoryProps {
	listingId: string;
	currentBid: number;
}

export function BidHistory({ listingId, currentBid }: BidHistoryProps) {
	const [bids, setBids] = useState<Bid[]>([]);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		getBids(listingId)
			.then((history) => {
				setBids(history);
				setFailed(false);
			})
			.catch(() => setFailed(true));
	}, [listingId, currentBid]);

	return (
		<section className="bid-history">
			<h4 className="bid-history__title">Bid History</h4>
			{failed && <p>Could not load bid history.</p>}
			{!failed && bids.length === 0 && <p>No bids yet.</p>}
			<ul className="bid-history__list">
				{bids.map((bid) => (
					<li key={bid.placedAt} className="bid-history__item">
						<span className="bid-history__bidder">{bid.bidder}</span>
						<span className="bid-history__amount">
							${bid.amount.toLocaleString()}
						</span>
					</li>
				))}
			</ul>
		</section>
	);
}
