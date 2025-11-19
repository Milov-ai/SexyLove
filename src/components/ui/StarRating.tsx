import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  className?: string;
}

const StarRating = ({ rating, className }: StarRatingProps) => {
  const validRating = typeof rating === "number" ? rating : 0;
  const fullStars = Math.floor(validRating);
  const halfStar = validRating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 text-yellow-400 fill-yellow-400"
        />
      ))}
      {halfStar && (
        <svg className="w-4 h-4">
          <defs>
            <linearGradient id="half_grad">
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#D1D5DB" stopOpacity="1" />
            </linearGradient>
          </defs>
          <Star
            key="half"
            className="w-4 h-4 text-yellow-400"
            fill="url(#half_grad)"
          />
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      ))}
    </div>
  );
};

export default StarRating;
