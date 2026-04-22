const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ─── POST /api/reviews ────────────────────────────────────────────────────
// Authenticated users can submit a review
exports.createReview = async (req, res) => {
  const { collegeName, rating, comment } = req.body;
  const userId = req.user?.id || null;

  if (!collegeName || !rating || !comment) {
    return res.status(400).json({ error: "collegeName, rating, and comment are required." });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }

  try {
    const review = await prisma.review.create({
      data: {
        userId,
        collegeName: collegeName.trim(),
        rating: parseInt(rating, 10),
        comment: comment.trim(),
      },
      include: { user: { select: { name: true } } },
    });

    res.status(201).json({
      success: true,
      data: {
        id:          review.id,
        collegeName: review.collegeName,
        rating:      review.rating,
        comment:     review.comment,
        createdAt:   review.createdAt,
        userName:    review.user?.name || "Anonymous",
      },
    });
  } catch (err) {
    console.error("createReview error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── GET /api/reviews ─────────────────────────────────────────────────────
// Public — anyone can read reviews
exports.getReviews = async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page  || "1",  10));
  const limit = Math.min(50, parseInt(req.query.limit || "20", 10));
  const skip  = (page - 1) * limit;
  const college = req.query.college; // optional filter by college

  try {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: college ? { collegeName: { contains: college, mode: "insensitive" } } : {},
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: college ? { collegeName: { contains: college, mode: "insensitive" } } : {},
      }),
    ]);

    res.json({
      success: true,
      data: reviews.map((r) => ({
        id:          r.id,
        collegeName: r.collegeName,
        rating:      r.rating,
        comment:     r.comment,
        createdAt:   r.createdAt,
        userName:    r.user?.name || "Anonymous",
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getReviews error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── DELETE /api/reviews/:id ──────────────────────────────────────────────
// Admin only
exports.deleteReview = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await prisma.review.delete({ where: { id } });
    res.json({ success: true, message: `Review ${id} deleted.` });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Review not found." });
    console.error("deleteReview error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
