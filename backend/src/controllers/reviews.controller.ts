import { asyncHandler } from "../middleware/asyncHandler";
import { Review } from "../models/Review";
import { HttpError } from "../services/httpError";

export const getGlobalReviews = asyncHandler(async (_req, res) => {
  const reviews = await Review.find({ isFeatured: true })
    .populate("userId", "name username avatar githubUrl")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const formattedReviews = reviews
    .filter((r) => r.userId != null)
    .map((r) => {
      const user = r.userId as unknown as {
        _id: string;
        name: string;
        username: string;
        avatar?: string;
        githubUrl?: string;
      };
      return {
        id: r._id.toString(),
        rating: r.rating,
        headline: r.headline || "Verified Builder",
        comment: r.comment,
        createdAt: r.createdAt,
        user: {
          id: user._id.toString(),
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          githubUrl: user.githubUrl,
        },
      };
    });

  // Calculate real average rating
  const totalReviews = formattedReviews.length;
  const averageRating =
    totalReviews > 0
      ? Number((formattedReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1))
      : 5.0;

  res.json({
    reviews: formattedReviews,
    stats: {
      averageRating,
      totalReviews,
    },
  });
});

export const getMyReview = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new HttpError(401, "Authentication required");
  }

  const review = await Review.findOne({ userId }).lean();
  if (!review) {
    res.json({ review: null });
    return;
  }

  res.json({
    review: {
      id: review._id.toString(),
      rating: review.rating,
      headline: review.headline || "",
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    },
  });
});

export const createOrUpdateReview = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new HttpError(401, "Authentication required");
  }

  const { rating, headline, comment } = req.body;
  const numRating = Number(rating);
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    throw new HttpError(400, "Rating must be an integer between 1 and 5");
  }

  const cleanComment = typeof comment === "string" ? comment.trim() : "";
  if (cleanComment.length < 10) {
    throw new HttpError(400, "Review comment must be at least 10 characters long");
  }
  if (cleanComment.length > 1000) {
    throw new HttpError(400, "Review comment must be 1000 characters or fewer");
  }

  const cleanHeadline = typeof headline === "string" ? headline.trim().slice(0, 100) : "";

  const savedReview = await Review.findOneAndUpdate(
    { userId },
    {
      rating: numRating,
      headline: cleanHeadline,
      comment: cleanComment,
      isFeatured: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate("userId", "name username avatar githubUrl");

  const user = savedReview.userId as unknown as {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
    githubUrl?: string;
  };

  res.status(200).json({
    review: {
      id: savedReview._id.toString(),
      rating: savedReview.rating,
      headline: savedReview.headline || "Verified Builder",
      comment: savedReview.comment,
      createdAt: savedReview.createdAt,
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        githubUrl: user.githubUrl,
      },
    },
  });
});

export const deleteMyReview = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new HttpError(401, "Authentication required");
  }

  await Review.findOneAndDelete({ userId });
  res.json({ success: true, message: "Review deleted successfully" });
});
