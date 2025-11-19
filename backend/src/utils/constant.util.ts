export const allowedSortFields = ["endTime", "price", "bidCount"] as const;

export const BID_CONSTANTS = {
    MIN_RATING_PERCENT: 0.8,
    MIN_RATING_REVIEWS: 0
} as const;

export const MASK_CONSTANTS = {
    NAME_VISIBLE_CHARS: 4,
    MASK_CHAR: '*'
} as const;