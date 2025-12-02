import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../ImageWithFallback";
import { Clock, Sparkles, ShoppingCart } from "lucide-react";
import { generateProductUrl } from "../../utils/urlHelpers";

interface ProductListCardProps {
  id: string;
  slug?: string; // Product slug for SEO-friendly URLs
  title: string;
  image: string;
  currentBid: number;
  buyNowPrice?: number;
  topBidder: string;
  timeLeft: string;
  isNewArrival?: boolean;
  bidCount: number;
}

export function ProductListCard({
  id,
  slug,
  title,
  image,
  currentBid,
  buyNowPrice,
  topBidder,
  timeLeft,
  isNewArrival = false,
  bidCount,
}: ProductListCardProps) {
  const navigate = useNavigate();

  // Generate URL: require slug for SEO, fallback to /products if missing
  const productUrl = slug ? generateProductUrl(slug, parseInt(id)) : `/products`;

  const handleCardClick = () => {
    navigate(productUrl);
  };

  const handlePlaceBid = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    navigate(productUrl); // Navigate to product detail for bidding
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    // TODO: Implement buy now logic
    console.log("Buy now clicked for product:", id);
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`group overflow-hidden bg-card hover:shadow-lg transition-all duration-300 cursor-pointer ${
        isNewArrival
          ? "border-accent shadow-accent/20 glow-accent"
          : "border-border hover:border-accent/50"
      }`}
    >
      {isNewArrival && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse"></div>
      )}

      <div className="relative aspect-square overflow-hidden bg-secondary">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {isNewArrival && (
          <Badge className="absolute top-2 left-2 bg-accent text-background border-none animate-pulse">
            <Sparkles className="h-3 w-3 mr-1" />
            New Arrival
          </Badge>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{timeLeft}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="text-sm line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-accent transition-colors">
            {title}
          </h3>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Top Bidder:</span>
            <span className="text-foreground">{topBidder}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Current Bid</span>
            <div className="text-accent text-lg">
              ${currentBid.toLocaleString()}
            </div>
          </div>

          {buyNowPrice && (
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Buy Now</span>
              <div className="text-success text-sm">
                ${buyNowPrice.toLocaleString()}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {bidCount} {bidCount === 1 ? "bid" : "bids"}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1" size="sm" onClick={handlePlaceBid}>
            Place Bid
          </Button>
          {buyNowPrice && (
            <Button
              variant="outline"
              size="sm"
              className="border-success/50 text-success hover:bg-success/10"
              onClick={handleBuyNow}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
