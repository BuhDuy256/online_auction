import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import {
  LogIn,
  LogOut,
  Menu,
  Search,
  Sparkles,
  BadgeDollarSign,
  User,
  CircleUserRound,
  BookA,
  Sun,
  Moon,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const Header: React.FC = () => {
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity text-accent"
          >
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/30">
              <BookA className="h-5 w-5 text-accent" />
            </div>
            <span className="tracking-tight text-lg">Auctionary</span>
          </Link>

          {/* Global Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for auctions, categories, or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(e);
                  }
                }}
                className="pl-10 h-11 bg-card border-border"
              />
            </div>
          </form>

          {/* Navigation & Auth */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              className="hidden lg:flex"
              onClick={() => navigate("/products")}
            >
              <Menu className="mr-2 h-4 w-4" />
              Browse
            </Button>
            {theme === "tactical" ? (
              <Button
                variant="ghost"
                className="lg:flex"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="lg:flex"
                onClick={() => setTheme("tactical")}
              >
                <Moon className="h-5 w-5" />
              </Button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 pl-4 border-l border-border">
                  <div className="hidden md:block text-right">
                    <div className="text-sm">Welcome back,</div>
                    <div className="text-xs text-muted-foreground">
                      {user?.fullName || user?.email}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="cursor-pointer outline-none">
                        <CircleUserRound className="h-10 w-10 text-muted-foreground hover:text-foreground transition-colors" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel className="font-bold">
                        {user?.fullName || user?.email}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => navigate("/profile")}
                        className="group cursor-pointer"
                      >
                        <User className="h-5 w-5 text-muted-foreground group-focus:text-accent-foreground transition-colors" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="group cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <LogOut className="h-5 w-5 text-destructive group-focus:text-destructive" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Upgrade Button */}
                {hasRole("seller") ? (
                  <Button
                    className="hidden lg:flex"
                    onClick={() => navigate("/seller/dashboard")}
                  >
                    <BadgeDollarSign className="mr h-4 w-4" />
                    Seller Dashboard
                  </Button>
                ) : (
                  <Button className="hidden lg:flex">
                    <Sparkles className="mr h-4 w-4" />
                    Upgrade to Seller
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/signup")}
                >
                  <User className="mr-2 h-5 w-5" />
                  <span className="font-bold">Sign Up</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  <span className="font-bold">Login</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
