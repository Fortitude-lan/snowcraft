"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { StarRating } from "./StarRating";
import { addReviewApi } from "@/api/auth";
import { toast } from "sonner";


import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";

interface Product {
    id: number;
    name: string;
}


export function WriteReviewForm({
    products,
    onSuccess,
    selectedProductId,
    onProductChange,
}: {
    products: Product[];
    onSuccess: () => void;
    selectedProductId: number | "";
    onProductChange: (id: number | "") => void;
}) {
    const { user } = useAuth(); // 用你自己的 useAuth 判断登录状态

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const placeholders = [
        "The nose felt like butter on powder days...",
        "Honestly the graphics alone made my crew jealous...",
        "Shredded Whistler top-to-bottom, zero complaints...",
        "Best custom board I've ever ridden. Period.",
    ];
    const [pidx, setPidx] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setPidx((i) => (i + 1) % placeholders.length), 3000);
        return () => clearInterval(t);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rating) return toast.error("Please select a star rating.");
        if (!selectedProductId) return toast.error("Please choose a board.");
        if (comment.trim().length < 10) return toast.error("Write at least 10 characters.");
        if (!user) return toast.error("User not logged in.");

        setSubmitting(true);

        try {
            await addReviewApi({
                rating,
                comment: comment.trim(),
                product_id: selectedProductId as number,
                user_id: Number(user.id),
            });

            toast.success("Review posted successfully!");
            setRating(0);
            setComment("");
            onProductChange("");
            onSuccess();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="p-6 rounded border border-dashed border-blue-500/20 bg-blue-500/[0.03] text-center space-y-3">
                <p className="text-sm text-zinc-500 italic">Sign in to drop your review.</p>
                <Link
                    href="/sign-in"
                    className="inline-block px-4 py-2 text-xs uppercase tracking-widest text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/10 transition-colors"
                >
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Board selector */}
            <div className="space-y-1.5">
                <label className="block text-[0.65rem] uppercase tracking-widest text-zinc-600">
                    Review Product Board
                </label>
                <Combobox
                    items={products}
                    itemToStringLabel={(product) => product?.name ?? ""}   // ⭐ 改这里
                    isItemEqualToValue={(a, b) => a.id === b.id}           // ⭐ 很重要
                    onValueChange={(product) => {
                        if (!product) {
                            onProductChange("")
                            return
                        }
                        onProductChange(product.id)   // ✅ 这里才是关键
                    }}

                >
                    <ComboboxInput placeholder="Select a product name" />

                    <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                            {(product) => (
                                <ComboboxItem key={product.id} value={product}>
                                    {product.name}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>

            </div>

            {/* Stars */}
            <div className="space-y-1.5">
                <label className="block text-[0.65rem] uppercase tracking-widest text-zinc-600">Rating</label>
                <StarRating value={rating} onChange={setRating} size={26} />
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
                <label className="block text-[0.65rem] uppercase tracking-widest text-zinc-600">Your Take</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={placeholders[pidx]}
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm text-zinc-100 rounded bg-zinc-900 border border-zinc-800 resize-none outline-none focus:ring-1 focus:ring-blue-500/40 transition-all placeholder:text-zinc-700 placeholder:italic italic"
                />
                <div className="text-right">
                    <span className="text-[0.6rem] text-zinc-700">{comment.length} chars</span>
                </div>
            </div>

            {error && <p className="text-xs text-red-400">✕ {error}</p>}
            {success && <p className="text-xs text-blue-400">✓ Review posted. Stoked!</p>}

            <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 text-xs uppercase tracking-widest text-blue-400 rounded border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-all disabled:opacity-40"
            >
                {submitting ? "Dropping it..." : "Post Review"}
            </button>
        </form>
    );
}
