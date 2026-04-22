const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [usersCount, subscribersCount, activityCount, reviewsCount, recentUsers] =
      await Promise.all([
        prisma.user.count(),
        prisma.subscriber.count(),
        prisma.userActivity.count(),
        prisma.review.count(),
        prisma.user.findMany({
          select: { id: true, name: true, email: true, created_at: true, role: true },
          orderBy: { created_at: "desc" },
          take: 5,
        }),
      ]);

    res.status(200).json({
      success: true,
      stats: { totalUsers: usersCount, totalSubscribers: subscribersCount, totalSearches: activityCount, totalReviews: reviewsCount, recentUsers },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ error: "Server error retrieving admin stats" });
  }
};

// ─── GET /api/admin/reviews ───────────────────────────────────────────
exports.getAllReviews = async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page  || "1",  10));
  const limit = Math.min(100, parseInt(req.query.limit || "20", 10));
  const skip  = (page - 1) * limit;

  try {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count(),
    ]);

    res.json({
      success: true,
      data: reviews.map((r) => ({
        id:          r.id,
        collegeName: r.collegeName,
        rating:      r.rating,
        comment:     r.comment,
        createdAt:   r.createdAt,
        userName:    r.user?.name  || "Anonymous",
        userEmail:   r.user?.email || "—",
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("getAllReviews error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── DELETE /api/admin/reviews/:id ───────────────────────────────────────
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

// ─── GET /api/admin/users ─────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "20", 10));
    const skip  = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          created_at: true,
          _count: { select: { activities: true } },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    res.json({
      success: true,
      data: users.map((u) => ({
        ...u,
        searchCount: u._count.activities,
        _count: undefined,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ─── GET /api/admin/activity ──────────────────────────────────────────────
exports.getActivity = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  || "1", 10));
    const limit = Math.min(200, parseInt(req.query.limit || "50", 10));
    const skip  = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.userActivity.findMany({
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.userActivity.count(),
    ]);

    res.json({
      success: true,
      data: logs.map((log) => ({
        id:         log.id,
        percentile: log.percentile,
        branch:     log.branch,
        category:   log.category,
        createdAt:  log.createdAt,
        userName:   log.user?.name  || "Guest",
        userEmail:  log.user?.email || "—",
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("getActivity error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
