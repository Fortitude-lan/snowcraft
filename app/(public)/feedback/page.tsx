"use client";

import { useEffect, useState, useCallback } from "react";
import { getReviewListApi ,getProductSelectListApi} from "@/api/auth"; // 根据你的路径调整

import { WriteReviewForm } from "./WriteReviewForm";
import { InfiniteCarousel } from "./InfiniteCarousel";
import { StarRating } from "./StarRating";
import { ReviewCard } from "./ReviewCard";
import { FaCaretRight, FaCaretLeft } from "react-icons/fa";
import { get } from "http";

// ─── Types ─────────────────────────────────────────────────────────────
interface Review {
  id: number;
  user: { username: string };
  product: { id: number; name: string };
  rating: number;
  comment: string;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
}

const PAGE_SIZE = 5;

// ─── Main Page ─────────────────────────────────────────────────────────
export default function ReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [productList, setproductList] = useState([])

  const [filter, setFilter] = useState<number | "all">("all");
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProductlist=()=>{
    getProductSelectListApi().then((res)=>{
      if(res.code===200){
        // console.log('product list for review select:',res.data);
        setproductList(res.data);
      }
    })
  }
  // ─── 请求数据 ──────────────────────────────────────────────────────
  const fetchReviews = useCallback(
    async (pageNum: number = 1, rating?: number | "all") => {
      setLoading(true);
      const res = await getReviewListApi(
        pageNum,
        PAGE_SIZE,
        rating && rating !== "all" ? { rating } : {}
      );

      if (res.code === 200) {
        setReviews(res.data.list);
        setTotal(res.data.total);
        setPage(pageNum);
      }
      setLoading(false);
    },
    []
  );

  // ─── 首次加载 ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchReviews(1, filter);
    fetchProductlist()  
  }, [fetchReviews, filter]);

  // ─── 星级筛选 ──────────────────────────────────────────────────────
  const handleFilterChange = (f: number | "all") => {
    setFilter(f);
    fetchReviews(1, f);
  };

  // ─── 分页 ─────────────────────────────────────────────────────────
  const handlePrevPage = () => {
    if (page > 1) fetchReviews(page - 1, filter);
  };

  const handleNextPage = () => {
    if (page * PAGE_SIZE < total) fetchReviews(page + 1, filter);
  };

  // 当前是否是 All
  const isAll = filter === "all";

  return (
    <div className="relative min-h-screen bg-brand-yellow overflow-x-hidden">
      <div className="relative pt-[10vh] md:pt-36 max-w-7xl mx-auto px-6 md:px-10 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-10 items-start">
          {/* Sidebar */}
          <aside className="md:sticky md:top-24 space-y-6">
            {reviews.length > 0 && (
              <div className="p-5 rounded border border-brand-navy">
                <p className="text-[0.8rem] uppercase tracking-widest text-brand-navy mb-4">
                  Overall Rating
                </p>
                <RatingStats reviews={reviews} />
              </div>
            )}

            <div className="p-5 rounded border border-brand-navy">
              <p className="text-[0.8rem] uppercase tracking-widest text-brand-navy mb-4">
                Drop Your Review
              </p>
              <WriteReviewForm
                products={productList}
                selectedProductId={selectedProductId}
                onProductChange={setSelectedProductId}
                onSuccess={() => fetchReviews(1, filter)}
              />
            </div>
          </aside>

          {/* Right content */}
          <div className="min-w-0">
            {/* Filter Pills */}
            <div className="flex gap-2 flex-wrap mb-4">
              {(["all", 5, 4, 3, 2, 1] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`px-3.5 py-1.5 text-xs uppercase tracking-widest rounded transition-all duration-200
                  ${filter === f
                      ? "bg-blue-500/15 border border-blue-500/40 text-blue-400"
                      : "bg-white/[0.03] border border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
                    }`}
                >
                  {f === "all" ? "All" : "★".repeat(f)}
                </button>
              ))}

              <div className="ml-auto text-[0.8rem] text-zinc-600 self-center gap-2 justify-center flex items-center">
                {!loading && !isAll && (
                  <div className="flex justify-center gap-1 px-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={page === 1}
                    >
                      <FaCaretLeft className="text-lg"
                        onClick={handlePrevPage}
                      />
                    </button>
                    <span className="py-1 text-[0.8rem]">
                      Page {page}/{Math.ceil(total / PAGE_SIZE)}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={page * PAGE_SIZE >= total}
                    >
                      <FaCaretRight className="text-lg"
                        onClick={handleNextPage}
                      />
                    </button>
                  </div>
                )}
                {total} posts
              </div>
            </div>

            {/* Reviews */}
            {loading ? (
              <div className="flex justify-center py-32 text-zinc-500">
                Loading reviews...
              </div>
            ) : isAll ? (
              <InfiniteCarousel initialReviews={reviews} onLoadMore={async () => []} hasMore={false} />
            ) : (
              <>
                <ReviewGrid reviews={reviews} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Grid View ─────────────────────────────────────────────────────────
function ReviewGrid({ reviews }: { reviews: Review[] }) {
  if (!reviews.length)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
        <span className="text-5xl opacity-10 font-bold">0</span>
        <p className="text-sm text-zinc-600 italic">No reviews at this rating yet.</p>
      </div>
    );

  return (
    <div className="columns-1 sm:columns-2 xl:columns-3 gap-6">
      {reviews.map((review) => (
        <div key={review.id} className="mb-6 break-inside-avoid">
          <ReviewCard review={review} />
        </div>
      ))}
    </div>
  );
}

// ─── Rating Stats ─────────────────────────────────────────────────────
function RatingStats({ reviews }: { reviews: Review[] }) {
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  const dist = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return {
      star,
      count,
      pct: (count / reviews.length) * 100,
    };
  });

  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 text-center">
        <div className="text-5xl font-bold text-blue-400 leading-none">{avg.toFixed(1)}</div>
        <div className="mt-1.5">
          <StarRating value={Math.round(avg)} readonly size={14} />
        </div>
        <p className="text-[0.6rem] uppercase tracking-widest text-zinc-600 mt-2">{reviews.length} reviews</p>
      </div>

      <div className="flex-1 space-y-1.5">
        {dist.map(({ star, count, pct }) => (
          <div key={star} className="flex items-center gap-2">
            <span className="text-xs text-zinc-600 w-3 text-right">{star}</span>
            <div className="flex-1 h-1.5 rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[0.6rem] text-zinc-600 w-4">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}