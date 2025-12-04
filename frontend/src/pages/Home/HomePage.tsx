import MainLayout from "../../layouts/MainLayout";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  BookA,
  DollarSign,
  Gavel,
  LogIn,
  Sparkles,
  TrendingUp,
  User,
  UserPlus,
  Zap,
} from "lucide-react";
import { ChevronRight } from "lucide-react";
import { AuctionCard } from "../../components/auction/AuctionCard";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

// Mock auction data
const endingSoonAuctions = [
  {
    id: "1",
    title: "Vintage Leica M6 Camera with 50mm Lens",
    image:
      "https://images.unsplash.com/photo-1495121553079-4c61bcce1894?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2FtZXJhfGVufDF8fHx8MTc2NDExMDk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 1250,
    bidCount: 15,
    endTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes
    isHot: true,
  },
  {
    id: "2",
    title: "Rolex Submariner Luxury Watch",
    image:
      "https://images.unsplash.com/photo-1670177257750-9b47927f68eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3YXRjaHxlbnwxfHx8fDE3NjQxNDA2OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 8500,
    bidCount: 42,
    endTime: new Date(Date.now() + 32 * 60 * 1000), // 32 minutes
    isHot: true,
  },
  {
    id: "3",
    title: "Gaming Laptop RTX 4080",
    image:
      "https://images.unsplash.com/photo-1640955014216-75201056c829?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBsYXB0b3B8ZW58MXx8fHwxNzY0MTUzNzI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 2100,
    bidCount: 28,
    endTime: new Date(Date.now() + 58 * 60 * 1000), // 58 minutes
  },
  {
    id: "4",
    title: "Vintage 1960s Fender Stratocaster Guitar",
    image:
      "https://images.unsplash.com/flagged/photo-1567532713210-eb4a2cf598f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZ3VpdGFyfGVufDF8fHx8MTc2NDE0NjkwNXww&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 4200,
    bidCount: 19,
    endTime: new Date(Date.now() + 72 * 60 * 1000), // 1h 12min
  },
  {
    id: "5",
    title: "Premium Motorcycle Racing Helmet",
    image:
      "https://images.unsplash.com/photo-1611004061856-ccc3cbe944b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwaGVsbWV0fGVufDF8fHx8MTc2NDE2ODU0OXww&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 380,
    bidCount: 8,
    endTime: new Date(Date.now() + 90 * 60 * 1000), // 1h 30min
  },
];

const mostActiveAuctions = [
  {
    id: "6",
    title: "Professional 4K Drone with Camera",
    image:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcm9uZSUyMGNhbWVyYXxlbnwxfHx8fDE3NjQxNzMzODN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 1850,
    bidCount: 67,
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
    isHot: true,
  },
  {
    id: "7",
    title: "Vintage Tube Radio 1950s",
    image:
      "https://images.unsplash.com/photo-1612869544295-eda1013274aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwcmFkaW98ZW58MXx8fHwxNzY0MTczMzg0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 420,
    bidCount: 54,
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
  },
  {
    id: "8",
    title: "Custom Mechanical Keyboard RGB",
    image:
      "https://images.unsplash.com/photo-1602025882379-e01cf08baa51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWNoYW5pY2FsJTIwa2V5Ym9hcmR8ZW58MXx8fHwxNzY0MDc0Nzk3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 650,
    bidCount: 48,
    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
    isHot: true,
  },
  {
    id: "9",
    title: "Antique Typewriter Remington",
    image:
      "https://images.unsplash.com/reserve/LJIZlzHgQ7WPSh5KVTCB_Typewriter.jpg?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwdHlwZXdyaXRlcnxlbnwxfHx8fDE3NjQwNDk3MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 320,
    bidCount: 39,
    endTime: new Date(Date.now() + 18 * 60 * 60 * 1000),
  },
  {
    id: "10",
    title: "Sony WH-1000XM5 Headphones",
    image:
      "https://images.unsplash.com/photo-1572119244337-bcb4aae995af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwYXVkaW98ZW58MXx8fHwxNzY0MTQzNTMzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 285,
    bidCount: 31,
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
];

const highestPriceAuctions = [
  {
    id: "11",
    title: "Rolex Submariner Luxury Watch",
    image:
      "https://images.unsplash.com/photo-1670177257750-9b47927f68eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3YXRjaHxlbnwxfHx8fDE3NjQxNDA2OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 8500,
    bidCount: 42,
    endTime: new Date(Date.now() + 36 * 60 * 60 * 1000),
    isHot: true,
  },
  {
    id: "12",
    title: "Vintage 1960s Fender Stratocaster Guitar",
    image:
      "https://images.unsplash.com/flagged/photo-1567532713210-eb4a2cf598f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZ3VpdGFyfGVufDF8fHx8MTc2NDE0NjkwNXww&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 4200,
    bidCount: 19,
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
  },
  {
    id: "13",
    title: "Limited Edition Sneakers Collection",
    image:
      "https://images.unsplash.com/photo-1761651469951-4b941ecb27dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWN0aWJsZSUyMHNuZWFrZXJzfGVufDF8fHx8MTc2NDA1MjQyMnww&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 3800,
    bidCount: 26,
    endTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
    isHot: true,
  },
  {
    id: "14",
    title: "Gaming Laptop RTX 4080",
    image:
      "https://images.unsplash.com/photo-1640955014216-75201056c829?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBsYXB0b3B8ZW58MXx8fHwxNzY0MTUzNzI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 2100,
    bidCount: 28,
    endTime: new Date(Date.now() + 20 * 60 * 60 * 1000),
  },
  {
    id: "15",
    title: "Rare Vinyl Record Collection",
    image:
      "https://images.unsplash.com/photo-1582730147924-d92f4da00252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZHN8ZW58MXx8fHwxNzY0MTE5Mjk5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 1950,
    bidCount: 23,
    endTime: new Date(Date.now() + 96 * 60 * 60 * 1000),
  },
];

export default function HomePage() {
  const { isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDZjMy4zMSAwIDYgMi42OSA2IDZzLTIuNjkgNi02IDYtNi0yLjY5LTYtNiAyLjY5LTYgNi02ek00OCAzNmMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6IiBzdHJva2U9IiNmZjk5MDAiIHN0cm9rZS13aWR0aD0iLjUiIG9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-3xl">
            <Badge
              className="mb-4 border-accent/50 bg-accent/10 text-accent"
              variant="outline"
            >
              <Zap className="mr-1 h-3 w-3" />
              Secure Trading Platform
            </Badge>
            <h1 className="text-5xl mb-4">
              Discover Rare Items.
              <br />
              <span className="text-accent">Bid with Confidence.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              Join the most secure anonymous auction platform. Browse exclusive
              listings, place tactical bids, and win items you've been searching
              for.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="text-base">
                <Sparkles className="mr-2 h-5 w-5" />
                Post Your Auction
              </Button>
              <Button size="lg" variant="outline" className="text-base">
                Browse Categories
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 space-y-12">
        {/* Section A: Ending Soon */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/30">
                <Zap className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-2xl">Ending Soon</h2>
                <p className="text-sm text-muted-foreground">
                  Last chance to bid on these items
                </p>
              </div>
            </div>
            <Button variant="ghost" className="text-accent">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {endingSoonAuctions.map((auction) => (
                <AuctionCard key={auction.id} {...auction} />
              ))}
            </div>
          </div>
        </section>

        {/* Section B: Most Active */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 border border-accent/30">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl">Most Active</h2>
                <p className="text-sm text-muted-foreground">
                  Items with the highest bidding activity
                </p>
              </div>
            </div>
            <Button variant="ghost" className="text-accent">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {mostActiveAuctions.map((auction) => (
                <AuctionCard key={auction.id} {...auction} />
              ))}
            </div>
          </div>
        </section>

        {/* Section C: Highest Price */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10 border border-success/30">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <h2 className="text-2xl">Highest Price</h2>
                <p className="text-sm text-muted-foreground">
                  Premium items with top dollar bids
                </p>
              </div>
            </div>
            <Button variant="ghost" className="text-accent">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {highestPriceAuctions.map((auction) => (
                <AuctionCard key={auction.id} {...auction} />
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="relative overflow-hidden rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 via-card to-card p-8 md:p-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDZjMy4zMSAwIDYgMi42OSA2IDZzLTIuNjkgNi02IDYtNi0yLjY5LTYtNiAyLjY5LTYgNi02ek00OCAzNmMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6IiBzdHJva2U9IiNmZjk5MDAiIHN0cm9rZS13aWR0aD0iLjUiIG9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-50"></div>

          {!isAuthenticated ? (
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <UserPlus className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-3xl mb-4">New to Auctionary?</h2>
              <p className="text-muted-foreground mb-6">
                Sign up now to start bidding on exclusive items. Join our
                community and find your next treasure today!
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  size="lg"
                  className="text-base"
                  onClick={() => navigate("/signup")}
                >
                  <User className="mr-2 h-5 w-5" />
                  Sign Up Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base"
                  onClick={() => navigate("/login")}
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Log In
                </Button>
              </div>
            </div>
          ) : hasRole("seller") ? (
            /* CASE 2: ĐÃ ĐĂNG NHẬP + LÀ SELLER */
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <BookA className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-3xl mb-4">Got something unique to sell?</h2>
              <p className="text-muted-foreground mb-6">
                Keep your inventory fresh! Create a new listing now and attract
                more bidders to your shop.
              </p>
              <Button
                size="lg"
                className="text-base"
                onClick={() => navigate("/under-development")}
              >
                <Gavel className="mr-2 h-5 w-5" />
                Create New Auction
              </Button>
            </div>
          ) : (
            /* CASE 3: ĐÃ ĐĂNG NHẬP + CHỈ LÀ BIDDER (Mời nâng cấp) */
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <Sparkles className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-3xl mb-4">Ready to Start Selling?</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of sellers on Auctionary. List your items, reach
                a global audience, and get paid securely through our escrow
                system.
              </p>
              <Button
                size="lg"
                className="text-base"
                onClick={() => navigate("/under-development")}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Become a Seller Today
              </Button>
            </div>
          )}
        </section>
      </main>
    </MainLayout>
  );
}
