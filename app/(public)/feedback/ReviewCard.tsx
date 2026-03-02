import { StarRating } from "./StarRating";


export function ReviewCard({ review, className = "" }: { review: Review; className?: string }) {
    const initials = review.user.username.slice(0, 2).toUpperCase();
    const date = new Date(review.created_at).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
    // Deterministic avatar hue from username
    const hue = (review.user.username.charCodeAt(0) * 37) % 360;

    return (
        <div className={`relative flex flex-col gap-3 p-5 rounded border border-black/[0.07] overflow-hidden ${className}`}>
            {/* Background rating watermark */}
            <span className="absolute -top-1 -right-1 text-[6rem] leading-none font-bold text-brand-blue/15 select-none pointer-events-none">
                {review.rating}
            </span>

            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    {/* Avatar */}
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border border-black/10"
                        style={{
                            backgroundColor: `hsl(${hue}, 45%, 22%)`,
                            color: `hsl(${hue}, 70%, 70%)`,
                        }}
                    >
                        {initials}
                    </div>
                    <div>
                        <p className="text-sm text-brand-navy leading-tight">{review.user.username}</p>
                        <p className="text-[0.65rem] text-brand-navy/45 mt-0.5">{review.product.name}</p>
                    </div>
                </div>
                <StarRating value={review.rating} readonly size={15} />
            </div>

            {/* Comment */}
            <p className="text-sm leading-relaxed text-zinc-400 italic relative ">
                "{review.comment}"
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-1">
                <span className="text-[0.6rem] uppercase tracking-widest text-zinc-600">{date}</span>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((d) => (
                        <span key={d} className={`w-1 h-1 rounded-full ${d <= review.rating ? "bg-blue-500" : "bg-zinc-800"}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}