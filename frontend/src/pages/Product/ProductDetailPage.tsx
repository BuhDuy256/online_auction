import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import {
  Heart,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Users,
} from "lucide-react";
import { ImageGallery } from "../../components/auction/ImageGallery";
import { ProductListCard } from "../../components/auction/ProductListCard";
import MainLayout from "../../layouts/MainLayout";
import * as productService from "../../services/productService";
import type { ProductDetailResponse, BidHistoryItem, QuestionItem } from "../../types/product-detail";
import { parseProductSlugId, calculateTimeLeft } from "../../utils/urlHelpers";

export default function ProductDetailPage() {
  const { id: slugWithId } = useParams<{ id: string }>();

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
        console.log("Product detail received:", data); // Debug log
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
    if (productData && bidAmount >= productData.auction.currentPrice + productData.auction.stepPrice) {
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
          <div className="text-center">Loading product details...</div>
        </div>
      </MainLayout>
    );
  }

  if (error || !productData) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || "Product not found"}</AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  const { product, seller, auction, userProductStatus } = productData;

  // Additional validation for required data
  if (!product || !seller || !auction) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Invalid product data received from server</AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  const timeLeft = calculateTimeLeft(auction.endTime);
  const minimumNextBid = auction.currentPrice + auction.stepPrice;

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-accent transition-colors">
              Home
            </Link>
            {product.breadcrumb.map((crumb, index) => (
              <div key={crumb.id} className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                {index === product.breadcrumb.length - 1 ? (
                  <span className="text-foreground">{crumb.name}</span>
                ) : (
                  <Link
                    to={`/products?categorySlug=${crumb.slug}`}
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Image Gallery */}
          <div>
            <ImageGallery images={product.images} />
          </div>

          {/* Right: Product Info & Bidding */}
          <div className="space-y-6">
            {/* Product Title */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleWatchlistToggle}
                  className={userProductStatus?.isWatchlisted ? "text-destructive" : ""}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      userProductStatus?.isWatchlisted ? "fill-red-500" : ""
                    }`}
                  />
                </Button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <Badge variant="secondary">{product.category.name}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-accent" />
                  <span>
                    Ends in <span className="text-accent font-medium">{timeLeft}</span>
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Seller Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-border">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seller.id}`} />
                  <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm">
                    Sold by <span className="text-accent font-medium">{seller.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= Math.round(seller.rating.average)
                              ? "fill-accent text-accent"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({seller.rating.totalReviews} reviews)
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs border-success/50 text-success"
                    >
                      {seller.rating.positivePercentage}% Positive
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* User Status Alerts */}
            {userProductStatus?.isOutbid && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You've been outbid! Current bid is ${auction.currentPrice.toLocaleString()}.
                  {userProductStatus.currentUserMaxBid && (
                    <> Your max bid: ${userProductStatus.currentUserMaxBid.toLocaleString()}</>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {bidPlaced && (
              <Alert className="border-success bg-success/10">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  Bid placed successfully! You're now the top bidder.
                </AlertDescription>
              </Alert>
            )}

            {/* Pricing Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Bid</div>
                    <div className="text-3xl font-bold text-accent">
                      ${auction.currentPrice.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{auction.watchlistCount} watching</span>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Starting Price</div>
                    <div className="font-medium">${auction.startPrice.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Bid Increment</div>
                    <div className="font-medium">${auction.stepPrice.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Bids</div>
                    <div className="font-medium">{auction.bidCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Top Bidder</div>
                    <div className="font-medium">{auction.topBidder}</div>
                  </div>
                </div>

                {auction.buyNowPrice && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Buy Now Price</div>
                      <Button className="w-full" variant="outline" size="lg">
                        Buy Now for ${auction.buyNowPrice.toLocaleString()}
                      </Button>
                    </div>
                  </>
                )}

                <Separator />

                {/* Bid Form */}
                <div className="space-y-3">
                  <Label htmlFor="maxBid">Your Maximum Bid</Label>
                  <Input
                    id="maxBid"
                    type="number"
                    placeholder={`Minimum $${minimumNextBid.toLocaleString()}`}
                    value={maxBid}
                    onChange={(e) => setMaxBid(e.target.value)}
                    min={minimumNextBid}
                  />
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePlaceBid}
                    disabled={!maxBid || parseFloat(maxBid) < minimumNextBid}
                  >
                    Place Bid
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Minimum bid: ${minimumNextBid.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="bidHistory">Bid History ({auction.bidCount})</TabsTrigger>
            <TabsTrigger value="qa">Q&A</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Product Overview</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{product.overview}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bidHistory">
            <Card>
              <CardContent className="p-6">
                {loadingBids ? (
                  <div className="text-center py-8">Loading bid history...</div>
                ) : bidHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No bids yet</div>
                ) : (
                  <div className="space-y-3">
                    {bidHistory.map((bid) => (
                      <div
                        key={bid.bidId}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          bid.isTopBid ? "bg-accent/10 border border-accent" : "bg-muted/50"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{bid.bidder}</span>
                            {bid.isTopBid && (
                              <Badge variant="default" className="text-xs">
                                Top Bid
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(bid.bidTime).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-accent">
                          ${bid.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qa">
            <Card>
              <CardContent className="p-6">
                {loadingQuestions ? (
                  <div className="text-center py-8">Loading questions...</div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No questions yet</div>
                ) : (
                  <div className="space-y-6">
                    {questions.map((qa) => (
                      <div key={qa.questionId} className="border-b pb-4 last:border-0">
                        <div className="mb-3">
                          <div className="flex items-start gap-2">
                            <span className="font-semibold">Q:</span>
                            <div className="flex-1">
                              <p>{qa.question}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Asked by {qa.askedBy} • {new Date(qa.askedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        {qa.answer && (
                          <div className="ml-6 bg-muted/50 p-3 rounded-lg">
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-accent">A:</span>
                              <div className="flex-1">
                                <p>{qa.answer.answer}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Answered by {qa.answer.answeredBy} •{" "}
                                  {new Date(qa.answer.answeredAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {product.relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Similar Items You May Like</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.relatedProducts.map((relatedProduct) => (
                <ProductListCard key={relatedProduct.id} {...relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </main>
    </MainLayout>
  );
}
