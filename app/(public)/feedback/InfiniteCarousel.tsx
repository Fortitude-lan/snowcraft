
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ReviewCard } from "./ReviewCard";

interface Review {
    id: number;
    user: { username: string };
    product: { id: number; name: string };
    rating: number;
    comment: string;
    created_at: string;
}

export function InfiniteCarousel({
    initialReviews,
    onLoadMore,
    hasMore,
}: {
    initialReviews: Review[];
    onLoadMore: () => Promise<Review[]>;
    hasMore: boolean;
}) {
    // Two separate track refs, each gets its own cloned set of cards
    const track1Ref = useRef<HTMLDivElement>(null);
    const track2Ref = useRef<HTMLDivElement>(null);
    const posRef = useRef(0);
    const rafRef = useRef<number>(0);
    const loadingMore = useRef(false);
    const [cards, setCards] = useState<Review[]>(initialReviews);
    const [paused, setPaused] = useState(false);
    const hasMoreRef = useRef(hasMore);
    hasMoreRef.current = hasMore;

    // Speed: px per frame at 60fps
    const SPEED = 0.5;

    const animate = useCallback(() => {
        if (!track1Ref.current || paused) {
            rafRef.current = requestAnimationFrame(animate);
            return;
        }
        const trackWidth = track1Ref.current.scrollWidth / 2; // half = one set of cards
        posRef.current += SPEED;

        // Reset seamlessly when we've scrolled one full set
        if (posRef.current >= trackWidth) posRef.current -= trackWidth;

        // Apply to both rows (row 2 goes slightly faster for depth effect)
        track1Ref.current.style.transform = `translateX(-${posRef.current}px)`;
        if (track2Ref.current) {
            track2Ref.current.style.transform = `translateX(-${(posRef.current * 1.3) % (track2Ref.current.scrollWidth / 2)}px)`;
        }

        // Trigger load when 70% through the track
        if (!loadingMore.current && hasMoreRef.current && posRef.current > trackWidth * 0.7) {
            loadingMore.current = true;
            onLoadMore().then((newCards) => {
                setCards((prev) => [...prev, ...newCards]);
                loadingMore.current = false;
            });
        }

        rafRef.current = requestAnimationFrame(animate);
    }, [paused, onLoadMore]);

    useEffect(() => {
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [animate]);

    useEffect(() => {
        setCards(initialReviews);
    }, [initialReviews.length]);

    // Split cards into two rows (odd/even index)
    const row1 = cards.filter((_, i) => i % 2 === 0);
    const row2 = cards.filter((_, i) => i % 2 === 1);

    return (
        <div
            className="relative w-full overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Row 1 */}
            <div className="mb-4 overflow-hidden">
                <div ref={track1Ref} className="flex gap-4 will-change-transform" style={{ width: "max-content" }}>
                    {/* Duplicate for seamless loop */}
                    {[...row1, ...row1].map((review, i) => (
                        <ReviewCard
                            key={`r1-${i}`}
                            review={review}
                            className="w-72 flex-shrink-0"
                        />
                    ))}
                </div>
            </div>

            {/* Row 2 — slightly offset start */}
            <div className="overflow-hidden">
                <div ref={track2Ref} className="flex gap-4 will-change-transform" style={{ width: "max-content", transform: "translateX(-60px)" }}>
                    {[...row2, ...row2].map((review, i) => (
                        <ReviewCard
                            key={`r2-${i}`}
                            review={review}
                            className="w-72 flex-shrink-0"
                        />
                    ))}
                </div>
            </div>

        </div>
    );
}


