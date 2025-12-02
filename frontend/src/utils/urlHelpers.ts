/**
 * Parse product slug-id pattern from URL
 * Example: "vintage-leica-m6-123" → { slug: "vintage-leica-m6", id: 123 }
 * Requires slug-id format, rejects numeric-only IDs for SEO
 */
export const parseProductSlugId = (slugWithId: string): { slug: string; id: number } | null => {
  // Check if input is purely numeric (old format) - reject it
  if (/^\d+$/.test(slugWithId)) {
    console.warn('Numeric-only product ID detected. Use slug-id format for SEO.');
    return null;
  }

  const lastDashIndex = slugWithId.lastIndexOf('-');

  if (lastDashIndex === -1) {
    return null;
  }

  const id = parseInt(slugWithId.substring(lastDashIndex + 1));
  const slug = slugWithId.substring(0, lastDashIndex);

  if (isNaN(id) || !slug) {
    return null;
  }

  return { slug, id };
};

/**
 * Generate product URL from slug and id
 * Example: ("vintage-leica-m6", 123) → "/products/vintage-leica-m6-123"
 */
export const generateProductUrl = (slug: string, id: number): string => {
  return `/products/${slug}-${id}`;
};

/**
 * Calculate time left from end time
 */
export const calculateTimeLeft = (endTime: string): string => {
  const now = Date.now();
  const end = new Date(endTime).getTime();
  const msLeft = end - now;

  if (msLeft <= 0) {
    return "Ended";
  }

  const days = Math.floor(msLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
