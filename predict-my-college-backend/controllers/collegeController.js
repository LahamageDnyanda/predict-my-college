const { PrismaClient } = require("@prisma/client");
const fs   = require("fs");
const path = require("path");

const prisma = new PrismaClient();

// ─── Tier helper ─────────────────────────────────────────────────────────
function getTier(percentile) {
  if (!percentile) return "Unknown";
  if (percentile >= 95) return "Top Tier";
  if (percentile >= 85) return "Mid Tier";
  return "Low Tier";
}

// ─── Chance helper ────────────────────────────────────────────────────────
function getChance(userPercentile, collegePercentile) {
  const gap = Number(userPercentile) - Number(collegePercentile);
  if (gap >= 3)  return { chance: "Safe",     chanceColor: "green"  };
  if (gap >= 0)  return { chance: "Moderate", chanceColor: "yellow" };
  return           { chance: "Risk",      chanceColor: "red"    };
}

// ─── Log activity ─────────────────────────────────────────────────────────
async function logActivity(userId, percentile, branch, category) {
  try {
    await prisma.userActivity.create({
      data: { userId: userId || null, percentile: Number(percentile), branch, category },
    });
  } catch (err) {
    console.error("Activity log error:", err.message);
  }
}

// ─── POST /api/predict ────────────────────────────────────────────────────
// Returns ALL rows (all years) so the frontend can group them into cards
exports.predictCollege = async (req, res) => {
  const { percentile, branch, category } = req.body;
  const userId = req.user?.id || null;

  try {
    const rows = await prisma.college.findMany({
      where: {
        percentile: { lte: Number(percentile || 100) },
        ...(category && { category: { equals: category, mode: "insensitive" } }),
        ...(branch   && { branch:   { equals: branch,   mode: "insensitive" } }),
      },
      orderBy: [{ name: "asc" }, { year: "asc" }],
    });

    // Log search in background
    logActivity(userId, percentile, branch || "Any", category || "Any");

    // 1. Group data by Unique Key (College + Branch + Category)
    const grouped = {};
    for (const row of rows) {
      const key = `${row.name}-${row.branch}-${row.category}`.toLowerCase();
      
      if (!grouped[key]) {
        grouped[key] = {
          collegeName: row.name,
          city:        row.city || "Maharashtra",
          branch:      row.branch,
          category:    row.category,
          cutoffs: {
            2023: null,
            2024: null,
            2025: null
          },
          predicted:   null,
          tier:        "Unknown",
          chance:      "Unknown",
          chanceColor: "grey",
        };
      }
      
      // Map year to cutoff
      if (row.year >= 2023 && row.year <= 2025) {
        grouped[key].cutoffs[row.year] = row.percentile;
      }

      // Calculate prediction & chance based on latest available year (prefer 2025)
      // Logic: if current row is 2025, or if we haven't found a predictor yet
      if (row.year === 2025 || (!grouped[key].predicted)) {
         const p = row.percentile;
         grouped[key].predicted = p;
         grouped[key].tier = getTier(p);
         const { chance, chanceColor } = getChance(percentile, p);
         grouped[key].chance = chance;
         grouped[key].chanceColor = chanceColor;
      }
    }

    // 2. Final cleanup and sorting
    const aggregated = Object.values(grouped).sort((a, b) => (b.predicted || 0) - (a.predicted || 0));

    res.json({ success: true, count: aggregated.length, data: aggregated });
  } catch (err) {
    console.error("predictCollege Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// ─── GET /api/college/:name ───────────────────────────────────────────────
// Returns ALL branches of a college across all years (no category filter needed)
exports.getCollegeDetail = async (req, res) => {
  const collegeName = decodeURIComponent(req.params.name);
  const year        = req.query.year ? parseInt(req.query.year, 10) : null;

  try {
    const rows = await prisma.college.findMany({
      where: {
        name: { contains: collegeName, mode: "insensitive" },
        ...(year && { year }),
      },
      orderBy: [{ branch: "asc" }, { year: "asc" }],
    });

    if (rows.length === 0) {
      return res.status(404).json({ error: "College not found." });
    }

    // Group by branch, then within each branch gather all year cutoffs
    const branchMap = {};
    for (const row of rows) {
      if (!branchMap[row.branch]) branchMap[row.branch] = {};
      const catKey = row.category;
      if (!branchMap[row.branch][catKey]) branchMap[row.branch][catKey] = {};
      branchMap[row.branch][catKey][row.year] = row.percentile;
    }

    const branches = Object.entries(branchMap).map(([branch, categories]) => ({
      branch,
      categories: Object.entries(categories).map(([category, cutoffs]) => ({
        category,
        cutoffs,
      })),
    }));

    res.json({
      success:     true,
      collegeName: rows[0].name,
      city:        rows[0].city,
      branches,
    });
  } catch (err) {
    console.error("getCollegeDetail Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// ─── GET /api/options ─────────────────────────────────────────────────────
exports.getOptions = async (req, res) => {
  try {
    const yearFilter = req.query.year ? { year: parseInt(req.query.year, 10) } : {};
    const [branchRows, categoryRows] = await Promise.all([
      prisma.college.findMany({
        where: yearFilter, select: { branch: true }, distinct: ["branch"], orderBy: { branch: "asc" },
      }),
      prisma.college.findMany({
        where: yearFilter, select: { category: true }, distinct: ["category"], orderBy: { category: "asc" },
      }),
    ]);
    res.json({
      success: true,
      data: {
        branches:   branchRows.map((b) => b.branch).filter(Boolean),
        categories: categoryRows.map((c) => c.category).filter(Boolean),
      },
    });
  } catch (err) {
    console.error("getOptions Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// ─── GET /api/cutoffs/:year ────────────────────────────────────────────────
exports.getCutoffsByYear = (req, res) => {
  const year = req.params.year;
  if (!["2023", "2024", "2025"].includes(year)) {
    return res.status(400).json({ error: "Invalid year. Use 2023, 2024, or 2025." });
  }
  const filePath = path.join(__dirname, "..", "..", "data_extraction", `cap_${year}_final.json`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "Data not found for the requested year" });
  }
};

// ─── POST /api/subscribe ──────────────────────────────────────────────────
exports.subscribeNewsletter = async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email address" });
  }
  try {
    await prisma.subscriber.create({ data: { email } });
    res.status(200).json({ success: true, message: "Successfully subscribed" });
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ error: "Email already subscribed" });
    console.error("subscribeNewsletter Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};