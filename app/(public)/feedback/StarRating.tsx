

import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { CiStar } from "react-icons/ci";


export function StarRating({
    value,
    onChange,
    readonly = false,
    size = 20,
}: {
    value: number;
    onChange?: (v: number) => void;
    readonly?: boolean;
    size?: number;
}) {
    const [hovered, setHovered] = useState(0);
    const display = readonly ? value : hovered || value;

    return (
        <div
            className="flex gap-0.5"
            role={readonly ? "img" : "radiogroup"}
            aria-label={`${value} out of 5 stars`}
        >
            {[1, 2, 3, 4, 5].map((star) => {
                const Icon = star <= display ? FaStar : CiStar;
                return (
                    <button
                        key={star}
                        type="button"
                        disabled={readonly}
                        onClick={() => onChange?.(star)}
                        onMouseEnter={() => !readonly && setHovered(star)}
                        onMouseLeave={() => !readonly && setHovered(0)}
                        className={
                            readonly
                                ? "cursor-default"
                                : "cursor-pointer transition-transform hover:scale-125"
                        }
                    >
                        <Icon size={size} className={star <= display ? "text-blue-500" : "text-zinc-600"} />
                    </button>
                );
            })}
        </div>
    );
}
