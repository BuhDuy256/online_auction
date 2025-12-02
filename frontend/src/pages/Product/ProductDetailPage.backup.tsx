import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import {
  Shield,
  Heart,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  MessageCircle,
  ChevronLeft,
  Zap,
  TrendingUp,
  Users,
} from "lucide-react";
import { ImageGallery } from "../../components/auction/ImageGallery";
import { BidHistory } from "../../components/auction/BidHistory";
import { ProductListCard } from "../../components/auction/ProductListCard";
import MainLayout from "../../layouts/MainLayout";
import * as productService from "../../services/productService";
import type { ProductDetailResponse, BidHistoryItem, QuestionItem } from "../../types/product-detail";
import { parseProductSlugId, calculateTimeLeft, formatCurrency, generateProductUrl } from "../../utils/urlHelpers";

// Product images
const productImages = [
  "https://images.unsplash.com/photo-1644726161754-b266e9cab7c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2FtZXJhJTIwZGV0YWlsfGVufDF8fHx8MTc2NDE3Mzk1NHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1724011015432-07d4056b9b18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lcmElMjBsZW5zJTIwY2xvc2V8ZW58MXx8fHwxNzY0MTczOTU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1734802236174-0abeaa6e54f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lcmElMjBiYWNrJTIwZGlzcGxheXxlbnwxfHx8fDE3NjQxNzM5NTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1673710672458-8a60b538ce98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lcmElMjBhY2Nlc3Nvcmllc3xlbnwxfHx8fDE3NjQxNjY4Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
];

// Bid history data
const bidHistoryData = [
  {
    id: "1",
    timestamp: "Nov 26, 2025 14:23:15",
    bidder: "****Chen",
    amount: 1350,
    isTopBid: true,
  },
  {
    id: "2",
    timestamp: "Nov 26, 2025 14:15:42",
    bidder: "****Huy",
    amount: 1300,
  },
  {
    id: "3",
    timestamp: "Nov 26, 2025 13:58:20",
    bidder: "****Mar",
    amount: 1250,
  },
  {
    id: "4",
    timestamp: "Nov 26, 2025 13:30:05",
    bidder: "****Kim",
    amount: 1200,
  },
  {
    id: "5",
    timestamp: "Nov 26, 2025 12:45:18",
    bidder: "****Lee",
    amount: 1150,
  },
  {
    id: "6",
    timestamp: "Nov 26, 2025 12:12:33",
    bidder: "****Wong",
    amount: 1100,
  },
];

// Q&A data
const qaData = [
  {
    id: "1",
    question: "Does this come with the original lens cap and manual?",
    answer:
      "Yes, it includes the original lens cap, manual, leather case, and original box. Everything is in excellent condition.",
    askedBy: "****Park",
    timestamp: "2 days ago",
  },
  {
    id: "2",
    question: "What is the shutter count?",
    answer:
      "The shutter count is approximately 12,500 actuations. This is very low for a camera of this age.",
    askedBy: "****Tran",
    timestamp: "3 days ago",
  },
  {
    id: "3",
    question: "Are there any scratches on the lens?",
    answer:
      "The lens is in pristine condition with no scratches. There is minimal dust inside which is normal for a vintage lens and does not affect image quality.",
    askedBy: "****Minh",
    timestamp: "4 days ago",
  },
  {
    id: "4",
    question: "Do you ship internationally?",
    answer:
      "Yes, I ship worldwide with full insurance and tracking. Shipping costs will be calculated based on your location.",
    askedBy: "****Alex",
    timestamp: "5 days ago",
  },
];

// Related products
const relatedProducts = [
  {
    id: "r1",
    title: "Sony A7 IV Professional Camera",
    image:
      "https://images.unsplash.com/photo-1606986601547-a4d886b671b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaXJyb3JsZXNzJTIwY2FtZXJhfGVufDF8fHx8MTc2NDE2NjgzNnww&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 2100,
    topBidder: "****Chen",
    timeLeft: "1d 3h",
    bidCount: 31,
    endTime: new Date(Date.now() + 27 * 60 * 60 * 1000),
  },
  {
    id: "r2",
    title: "Professional Studio Headphones",
    image:
      "https://images.unsplash.com/photo-1597859359746-f6efe49ce11a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkcGhvbmVzfGVufDF8fHx8MTc2NDA2OTI3OXww&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 285,
    topBidder: "****Lee",
    timeLeft: "12h 5m",
    bidCount: 15,
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
  },
  {
    id: "r3",
    title: "Vintage Camera Lens 50mm f/1.4",
    image:
      "https://images.unsplash.com/photo-1495121553079-4c61bcce1894?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2FtZXJhfGVufDF8fHx8MTc2NDExMDk5MXww&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 420,
    topBidder: "****Park",
    timeLeft: "8h 20m",
    bidCount: 22,
    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
  },
  {
    id: "r4",
    title: "Retro Film Camera Collection",
    image:
      "https://images.unsplash.com/photo-1644726161754-b266e9cab7c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2FtZXJhJTIwZGV0YWlsfGVufDF8fHx8MTc2NDE3Mzk1NHww&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 780,
    topBidder: "****Wong",
    timeLeft: "2d 5h",
    bidCount: 38,
    endTime: new Date(Date.now() + 53 * 60 * 60 * 1000),
  },
  {
    id: "r5",
    title: "Camera Accessory Bundle",
    image:
      "https://images.unsplash.com/photo-1673710672458-8a60b538ce98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lcmElMjBhY2Nlc3Nvcmllc3xlbnwxfHx8fDE3NjQxNjY4Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    currentBid: 195,
    topBidder: "****Kim",
    timeLeft: "5h 42m",
    bidCount: 12,
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
  },
];

export default function ProductDetailPage() {
  const { id: slugWithId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Parse slug-id from URL
  const parsed = slugWithId ? parseProductSlugId(slugWithId) : null;
  const productId = parsed?.id;

  // State
  const [productData, setProductData] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [maxBid, setMaxBid] = useState("");
  const [bidPlaced, setBidPlaced] = useState(false);
  
  // Lazy load states
  const [activeTab, setActiveTab] = useState("description");
  const [bidHistory, setBidHistory] = useState<BidHistoryItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Fetch product detail
  useEffect(() => {
    if (!productId) {
      setError("Invalid product URL");
      setLoading(false);
      return;
    }

    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductDetail(productId);
        setProductData(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);

  // Lazy load bid history when tab is clicked
  useEffect(() => {
    if (activeTab === "bidHistory" && productId && bidHistory.length === 0 && !loadingBids) {
      const fetchBidHistory = async () => {
        try {
          setLoadingBids(true);
          const data = await productService.getProductBidHistory(productId, 1, 20);
          setBidHistory(data.bids);
        } catch (err) {
          console.error("Failed to fetch bid history:", err);
        } finally {
          setLoadingBids(false);
        }
      };
      fetchBidHistory();
    }
  }, [activeTab, productId, bidHistory.length, loadingBids]);

  // Lazy load questions when tab is clicked
  useEffect(() => {
    if (activeTab === "qa" && productId && questions.length === 0 && !loadingQuestions) {
      const fetchQuestions = async () => {
        try {
          setLoadingQuestions(true);
          const data = await productService.getProductQuestions(productId, 1, 10);
          setQuestions(data.questions);
        } catch (err) {
          console.error("Failed to fetch questions:", err);
        } finally {
          setLoadingQuestions(false);
        }
      };
      fetchQuestions();
    }
  }, [activeTab, productId, questions.length, loadingQuestions]);

  const handlePlaceBid = () => {
    const bidAmount = parseFloat(maxBid);
    if (productData && bidAmount > productData.auction.currentPrice) {
      setBidPlaced(true);
      setTimeout(() => setBidPlaced(false), 5000);
      // TODO: Call place bid API
    }
  };

  const handleWatchlistToggle = async () => {
    // TODO: Call watchlist API
    console.log("Toggle watchlist");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (error || !productData) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-destructive">{error || "Product not found"}</div>
        </div>
      </MainLayout>
    );
  }

  const { product, seller, auction, userProductStatus } = productData;
  const timeLeft = calculateTimeLeft(auction.endTime);
  const minimumNextBid = auction.currentPrice + auction.stepPrice;

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <a
              href="#"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              Home
            </a>
            <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
            <a
              href="#"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              Electronics
            </a>
            <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
            <a
              href="#"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              Cameras
            </a>
            <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
            <span className="text-foreground">Vintage Leica M6</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Image Gallery */}
          <div>
            <ImageGallery images={productImages} />
          </div>

          {/* Right: Product Info & Bidding */}
          <div className="space-y-6">
            {/* Product Title & Seller Info */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl">
                  Vintage Leica M6 Camera with 50mm f/2 Lens
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsWatchlisted(!isWatchlisted)}
                  className={isWatchlisted ? "text-destructive" : ""}
                >
                  <Heart
                    className={`h-5 w-5 ${isWatchlisted ? "fill-red-500" : ""}`}
                  />
                </Button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <Badge variant="secondary">Cameras & Photography</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-accent" />
                  <span>
                    Ends in <span className="text-accent">{timeLeft}</span>
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Seller Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-border">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Seller" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm">
                    Sold by <span className="text-accent">****Smith</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-3.5 w-3.5 fill-accent text-accent"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      (248 reviews)
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs border-success/50 text-success"
                    >
                      98% Positive
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Outbid Alert */}
            {userOutbid && (
              <Alert
                variant="destructive"
                className="border-destructive bg-destructive/10"
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>You have been outbid!</AlertTitle>
                <AlertDescription>
                  Another bidder has placed a higher bid. Place a new bid to
                  stay in the auction.
                </AlertDescription>
              </Alert>
            )}

            {/* Bid Placed Success */}
            {bidPlaced && (
              <Alert className="border-success bg-success/10">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertTitle className="text-success">
                  Bid Placed Successfully!
                </AlertTitle>
                <AlertDescription className="text-success/90">
                  Your maximum bid has been recorded. We'll automatically bid
                  for you up to your limit.
                </AlertDescription>
              </Alert>
            )}

            {/* Bidding Area */}
            <Card className="border-accent/30 shadow-lg shadow-accent/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardDescription>Current Price</CardDescription>
                    <CardTitle className="text-4xl text-accent mt-1">
                      ${currentPrice.toLocaleString()}
                    </CardTitle>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Watchers
                    </div>
                    <div className="flex items-center gap-1 text-accent mt-1">
                      <Users className="h-4 w-4" />
                      <span>47</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Proxy Bidding Info */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm mb-1">Proxy Bidding Active</div>
                    <p className="text-xs text-muted-foreground">
                      We will automatically bid for you up to your maximum
                      amount. You'll only pay slightly more than the next
                      highest bid.
                    </p>
                  </div>
                </div>

                {/* Bid Form */}
                <div className="space-y-3">
                  <Label htmlFor="maxBid">Your Maximum Bid</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="maxBid"
                        type="number"
                        placeholder="Enter amount"
                        value={maxBid}
                        onChange={(e) => setMaxBid(e.target.value)}
                        className="pl-7"
                        min={currentPrice + 50}
                      />
                    </div>
                    <Button
                      onClick={handlePlaceBid}
                      disabled={!maxBid || parseFloat(maxBid) <= currentPrice}
                      className="px-8"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Place Bid
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum bid: ${(currentPrice + 50).toLocaleString()}
                  </p>
                </div>

                <Separator />

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Total Bids
                    </div>
                    <div className="text-lg text-accent">
                      {bidHistoryData.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Starting Price
                    </div>
                    <div className="text-lg">$1,000</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Bid Increment
                    </div>
                    <div className="text-lg">$50</div>
                  </div>
                </div>

                {/* Secondary Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsWatchlisted(!isWatchlisted)}
                >
                  <Heart
                    className={`mr-2 h-4 w-4 ${
                      isWatchlisted ? "fill-current" : ""
                    }`}
                  />
                  {isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
                </Button>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="border-success/50 text-success text-xs"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified Seller
              </Badge>
              <Badge
                variant="outline"
                className="border-accent/50 text-accent text-xs"
              >
                <Shield className="h-3 w-3 mr-1" />
                Buyer Protection
              </Badge>
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending Auction
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="history">Bid History</TabsTrigger>
            <TabsTrigger value="qa">Q&A ({qaData.length})</TabsTrigger>
          </TabsList>

          {/* Description Tab */}
          <TabsContent value="description" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none space-y-4">
                <p className="text-foreground">
                  This is a beautiful vintage Leica M6 rangefinder camera in
                  excellent condition. The camera has been professionally tested
                  and is in perfect working order. It comes with the original
                  50mm f/2 Summicron lens, which produces stunning images with
                  beautiful bokeh and exceptional sharpness.
                </p>

                <h3 className="text-lg mt-6 mb-3">Condition</h3>
                <ul className="list-disc list-inside space-y-2 text-foreground">
                  <li>
                    Camera body: 9/10 condition with minimal signs of wear
                  </li>
                  <li>
                    Lens: Pristine optical condition, no scratches or fungus
                  </li>
                  <li>Viewfinder: Clear and bright</li>
                  <li>Shutter: Tested and working perfectly at all speeds</li>
                  <li>Light meter: Accurate and responsive</li>
                </ul>

                <h3 className="text-lg mt-6 mb-3">What's Included</h3>
                <ul className="list-disc list-inside space-y-2 text-foreground">
                  <li>Leica M6 Camera Body (Chrome)</li>
                  <li>Leica Summicron 50mm f/2 Lens</li>
                  <li>Original leather case</li>
                  <li>Lens cap (front and rear)</li>
                  <li>Original manual and documentation</li>
                  <li>Original box</li>
                </ul>

                <Separator className="my-6" />

                {/* Updates Section */}
                <div className="space-y-4">
                  <h3 className="text-lg">Seller Updates</h3>

                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-md bg-accent/20">
                          <Info className="h-4 w-4 text-accent" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm mb-1">
                            Additional photos added
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Nov 25, 2025 10:30 AM - Added close-up shots of the
                            lens elements and shutter mechanism
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-md bg-success/20">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm mb-1">
                            Professional inspection completed
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Nov 24, 2025 2:15 PM - Camera has been
                            professionally tested and certified by authorized
                            technician
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bid History Tab */}
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Bid History</CardTitle>
                <CardDescription>
                  Complete history of all bids placed on this auction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BidHistory bids={bidHistoryData} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Q&A Tab */}
          <TabsContent value="qa" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Questions & Answers</CardTitle>
                <CardDescription>
                  Ask the seller a question about this item
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ask Question */}
                <div className="p-4 rounded-lg border border-border bg-card/50">
                  <Button className="w-full" variant="outline">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Ask a Question
                  </Button>
                </div>

                {/* Q&A List */}
                <Accordion type="single" collapsible className="w-full">
                  {qaData.map((qa) => (
                    <AccordionItem key={qa.id} value={qa.id}>
                      <AccordionTrigger className="text-left">
                        <div className="flex-1">
                          <div className="text-sm pr-4">{qa.question}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Asked by {qa.askedBy} • {qa.timestamp}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-4 border-l-2 border-accent/30 py-2">
                          <div className="flex items-start gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className="text-xs border-accent/50 text-accent"
                            >
                              Seller Response
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {qa.answer}
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">Similar Items You May Like</h2>
            <Button variant="ghost" className="text-accent">
              View All
              <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {relatedProducts.map((product) => (
              <ProductListCard key={product.id} {...product} />
            ))}
          </div>
        </section>
      </main>
    </MainLayout>
  );
}
