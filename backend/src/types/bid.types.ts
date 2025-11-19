export interface HighestBidder {
    current_price: number;
    highest_bidder: {
        id: number;
        full_name: string;
        positive_reviews: number;
        negative_reviews: number;
    }
}

export interface BidHistoryItem {
    created_at: Date;
    bidder_name: string;
    amount: number;
}
