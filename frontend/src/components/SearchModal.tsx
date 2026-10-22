"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ArrowRight,
  Sparkles,
  MapPin,
  Home,
  FileText,
  UserPlus,
  LogIn,
  Shield,
  HelpCircle,
  TrendingUp,
  History,
} from "lucide-react";

export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Navigation" | "Locations & Zones" | "Property Scenarios" | "Account";
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const SEARCH_DATABASE: SearchItem[] = [
  // Navigation & Core Pages
  {
    id: "nav-predict",
    title: "Estimate Property Value",
    subtitle: "Run the machine learning regression model with property attributes",
    category: "Navigation",
    href: "/predict",
    icon: Sparkles,
    badge: "Core ML",
  },
  {
    id: "nav-history",
    title: "Valuation History",
    subtitle: "View your saved private valuation requests and records",
    category: "Navigation",
    href: "/history",
    icon: History,
    badge: "History",
  },
  {
    id: "nav-insights",
    title: "Market Insights & Trends",
    subtitle: "Explore key pricing factors, location dynamics, and growth trends",
    category: "Navigation",
    href: "/#insights",
    icon: TrendingUp,
    badge: "Editorial",
  },
  {
    id: "nav-how-it-works",
    title: "How It Works",
    subtitle: "Step-by-step overview of features, model pipeline, and valuation outputs",
    category: "Navigation",
    href: "/#how-it-works",
    icon: FileText,
  },
  {
    id: "nav-faq",
    title: "Frequently Asked Questions",
    subtitle: "Accuracy metrics (96.2% R²), data privacy, and model training scope",
    category: "Navigation",
    href: "/#faq",
    icon: HelpCircle,
  },
  {
    id: "nav-admin",
    title: "Admin Analytics Portal",
    subtitle: "Audit system throughput, registered users, and date-filtered reports",
    category: "Navigation",
    href: "/admin",
    icon: Shield,
    badge: "Admin",
  },

  // Account Operations
  {
    id: "acc-register",
    title: "Create New Account",
    subtitle: "Sign up for a RealEstateIQ account to permanently store your valuation history",
    category: "Account",
    href: "/register",
    icon: UserPlus,
    badge: "New",
  },
  {
    id: "acc-login",
    title: "Sign In",
    subtitle: "Log in with your existing email, password, or demo credentials",
    category: "Account",
    href: "/login",
    icon: LogIn,
  },

  // Location & Zone Valuation Benchmarks
  {
    id: "zone-urban",
    title: "Urban Zone Properties",
    subtitle: "Dense commercial and transit corridors with high property appreciation",
    category: "Locations & Zones",
    href: "/predict?location=Urban",
    icon: MapPin,
    badge: "Urban",
  },
  {
    id: "zone-suburban",
    title: "Suburban Zone Properties",
    subtitle: "Family residential neighborhoods, schools, and spacious community villas",
    category: "Locations & Zones",
    href: "/predict?location=Suburban",
    icon: MapPin,
    badge: "Suburban",
  },
  {
    id: "zone-rural",
    title: "Rural Zone Properties",
    subtitle: "Quiet countryside parcels, expansive square footage, and low density",
    category: "Locations & Zones",
    href: "/predict?location=Rural",
    icon: MapPin,
    badge: "Rural",
  },

  // Pre-configured Property Valuation Scenarios
  {
    id: "prop-3bhk-suburban",
    title: "3 BHK Suburban Villa (1,800 sqft)",
    subtitle: "3 bedrooms, 2 bathrooms, 2020 construction with private garage",
    category: "Property Scenarios",
    href: "/predict?location=Suburban&sqft=1800&bed=3&bath=2&garage=true&year=2020",
    icon: Home,
    badge: "Popular",
  },
  {
    id: "prop-2bhk-urban",
    title: "2 BHK Urban High-Rise (1,100 sqft)",
    subtitle: "2 bedrooms, 2 bathrooms, metro zone transit access",
    category: "Property Scenarios",
    href: "/predict?location=Urban&sqft=1100&bed=2&bath=2&garage=false&year=2021",
    icon: Home,
  },
  {
    id: "prop-4bhk-luxury",
    title: "4 BHK Luxury Estate Villa (3,200 sqft)",
    subtitle: "4 bedrooms, 3 bathrooms, multi-car garage, premium fixtures",
    category: "Property Scenarios",
    href: "/predict?location=Urban&sqft=3200&bed=4&bath=3&garage=true&year=2023",
    icon: Home,
    badge: "Luxury",
  },
  {
    id: "prop-rural-acreage",
    title: "Spacious Rural Residence (2,500 sqft)",
    subtitle: "3 bedrooms, 2 bathrooms, peaceful countryside surroundings",
    category: "Property Scenarios",
    href: "/predict?location=Rural&sqft=2500&bed=3&bath=2&garage=true&year=2018",
    icon: Home,
  },
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return SEARCH_DATABASE;
    }
    return SEARCH_DATABASE.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.badge?.toLowerCase().includes(q)
    );
  }, [query]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  const handleSelect = (item: SearchItem) => {
    onClose();
    router.push(item.href);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev <= 0 ? Math.max(0, filteredItems.length - 1) : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E4E2DC] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        {/* Search Header Bar */}
        <div className="flex items-center px-6 py-4 border-b border-[#E4E2DC] gap-3 bg-[#FAF9F7]">
          <Search className="h-5 w-5 text-[#3C5484] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, locations, property features, or actions..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[#0D0B0B] placeholder-[#797C90] focus:outline-hidden"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-full hover:bg-[#E4E2DC] text-[#797C90] transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-[#797C90] bg-white border border-[#E4E2DC] rounded-md shadow-2xs">
              ESC
            </kbd>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#E4E2DC] text-[#797C90] transition-colors ml-1"
            title="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-[#F1F0EF]">
          {filteredItems.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-[#F1F0EF] text-[#797C90] mx-auto flex items-center justify-center">
                <Search className="h-5 w-5 text-[#3C5484]" />
              </div>
              <h3 className="font-display text-base font-semibold text-[#0D0B0B]">
                No matching results found
              </h3>
              <p className="text-xs text-[#797C90] max-w-sm mx-auto">
                No properties or actions match &ldquo;{query}&rdquo;. Try searching for &ldquo;Urban&rdquo;, &ldquo;Villa&rdquo;, &ldquo;Account&rdquo;, or &ldquo;Estimate&rdquo;.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    router.push("/predict");
                  }}
                  className="px-4 py-2 rounded-full bg-[#3C5484] text-white text-xs font-semibold hover:bg-[#2C3E63] transition-colors"
                >
                  Open Custom Valuation Tool
                </button>
              </div>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#3C5484]/10 border border-[#3C5484]/30 text-[#0D0B0B]"
                      : "hover:bg-[#F1F0EF] border border-transparent text-[#0D0B0B]"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#3C5484] text-white"
                          : "bg-[#F1F0EF] text-[#3C5484]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                              isSelected
                                ? "bg-[#3C5484] text-white"
                                : "bg-[#F1F0EF] text-[#5F7091] border border-[#E4E2DC]"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#797C90] truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[11px] font-medium text-[#797C90] hidden sm:inline">
                      {item.category}
                    </span>
                    <ArrowRight
                      className={`h-4 w-4 transition-transform ${
                        isSelected ? "text-[#3C5484] translate-x-1" : "text-[#9DA0A9]"
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-6 py-3 border-t border-[#E4E2DC] bg-[#FAF9F7] flex items-center justify-between text-[11px] text-[#797C90]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-[#E4E2DC] bg-white text-[10px] font-bold">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-[#E4E2DC] bg-white text-[10px] font-bold">
                ↓
              </kbd>{" "}
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-[#E4E2DC] bg-white text-[10px] font-bold">
                ↵
              </kbd>{" "}
              Select
            </span>
          </div>
          <span>RealEstateIQ Fast Command Search</span>
        </div>
      </div>
    </div>
  );
}
