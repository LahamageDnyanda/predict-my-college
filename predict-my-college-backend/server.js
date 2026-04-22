const express = require("express");
const cors = require("cors");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

const { verifyToken, requireAuth } = require("./middleware/authMiddleware");

// ─── CORS ─────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(null, true); // permissive fallback for Vercel deployments
    },
  })
);

app.use(express.json());

// Soft token decode on every request (attaches req.user if valid token present)
app.use(verifyToken);

// ─── External routers ─────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const collegeRoutes = require("./routes/collegeRoutes");

app.use("/api", collegeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", require("./routes/reviewRoutes"));

// ─── GET /api/branches ────────────────────────────────────────────────────
app.get("/api/branches", requireAuth, async (req, res) => {
  try {
    const yearFilter = req.query.year ? { year: parseInt(req.query.year, 10) } : {};
    const rows = await prisma.college.findMany({
      where: yearFilter,
      select: { branch: true },
      distinct: ["branch"],
      orderBy: { branch: "asc" },
    });
    res.json(rows.map((r) => r.branch).filter(Boolean));
  } catch (err) {
    console.error("GET /api/branches:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/categories ──────────────────────────────────────────────────
app.get("/api/categories", requireAuth, async (req, res) => {
  try {
    const yearFilter = req.query.year ? { year: parseInt(req.query.year, 10) } : {};
    const rows = await prisma.college.findMany({
      where: yearFilter,
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });
    res.json(rows.map((r) => r.category).filter(Boolean));
  } catch (err) {
    console.error("GET /api/categories:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/predict ─────────────────────────────────────────────────────
app.get("/api/predict", requireAuth, async (req, res) => {
  const { percentile, category, branch, year } = req.query;
  try {
    const colleges = await prisma.college.findMany({
      where: {
        percentile: { lte: Number(percentile || 100) },
        ...(category && { category: { equals: category, mode: "insensitive" } }),
        ...(branch && { branch: { equals: branch, mode: "insensitive" } }),
        ...(year && { year: parseInt(year, 10) }),
      },
      orderBy: { percentile: "desc" },
    });
    res.json(colleges);
  } catch (err) {
    console.error("GET /api/predict:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/colleges ────────────────────────────────────────────────────
// Distinct list of colleges (name + city) for the Colleges & Cutoffs page
app.get("/api/colleges", requireAuth, async (req, res) => {
  const year = req.query.year ? parseInt(req.query.year, 10) : null;
  try {
    const rows = await prisma.college.findMany({
      where: year ? { year } : {},
      select: { name: true, city: true },
      distinct: ["name"],
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET /api/colleges:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/health ─────────────────────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  try {
    const [collegeCount, userCount, activityCount] = await Promise.all([
      prisma.college.count(),
      prisma.user.count(),
      prisma.userActivity.count(),
    ]);
    res.json({ status: "ok", collegeCount, userCount, activityCount });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ─── GET / ───────────────────────────────────────────────────────────────
// app.get("/", (_req, res) => {
//   res.json({
//     message: "API is running ✅",
//     version: "1.0.0",
//     endpoints: {
//       predict:    "GET /api/predict?percentile=95&category=OPEN&branch=Computer Engineering",
//       branches:   "GET /api/branches",
//       categories: "GET /api/categories",
//       health:     "GET /api/health",
//       login:      "POST /api/auth/login",
//       register:   "POST /api/auth/register",
//     },
//   });
// });

// ─── GET /api/options ─────────────────────────────────────────────────────
// Redundant check: ensure /api/options is reachable
app.get("/api/options", requireAuth, async (req, res) => {
  try {
    const [branchRows, categoryRows] = await Promise.all([
      prisma.college.findMany({ select: { branch: true }, distinct: ["branch"], orderBy: { branch: "asc" } }),
      prisma.college.findMany({ select: { category: true }, distinct: ["category"], orderBy: { category: "asc" } }),
    ]);
    res.json({
      success: true,
      data: {
        branches: branchRows.map((b) => b.branch).filter(Boolean),
        categories: categoryRows.map((c) => c.category).filter(Boolean),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API 404 handler ─────────────────────────────────────────────────────
// Catch all other /api routes that weren't matched above
app.all("/api/*path", (req, res) => {
  res.status(404).json({
    error: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Static files & React routing ────────────────────────────────────────
// Serve static assets from frontend build
app.use(express.static(path.join(__dirname, "../predict-my-college-frontend/build")));

// Always serve index.html for any non-API route to support React Router
// Note: In Express 5, '*' is replaced by '/*path' or similar named wildcards
app.get("/*path", (req, res) => {
  res.sendFile(path.join(__dirname, "../predict-my-college-frontend/build", "index.html"));
});

// ─── Start server ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`);
  console.log(`   Try: http://localhost:${PORT}/api/predict?percentile=95&category=OPEN&branch=Computer Engineering`);
});