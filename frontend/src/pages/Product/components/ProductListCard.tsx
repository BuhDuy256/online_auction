import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { ImageWithFallback } from "../../../components/ImageWithFallback";
import { Clock, Sparkles, ShoppingCart } from "lucide-react";

interface ProductListCardProps {
  id: string;
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
  title,
  image,
  currentBid,
  buyNowPrice,
  topBidder,
  timeLeft,
  isNewArrival = false,
  bidCount,
}: ProductListCardProps) {
  return (
    <Card
      className={`group overflow-hidden bg-card hover:shadow-lg transition-all duration-300 ${
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

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Buy Now</span>
              <div className="text-success text-sm">
                {buyNowPrice? "$" + buyNowPrice.toLocaleString(): "---"}
              </div>
            </div>

          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Bids</span>
            <div className="text-success text-foreground">
              {bidCount}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1" size="sm">
            Place Bid
          </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-success/50 text-success hover:bg-success/10"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Buy
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
