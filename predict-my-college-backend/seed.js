/**
 * seed.js
 * -------
 * Reads data/colleges.csv and bulk-inserts records into Neon PostgreSQL
 * via Prisma.
 *
 * Run:  node seed.js
 *
 * Prerequisites:
 *   1. Run generate_csv.js first to build data/colleges.csv
 *   2. Run: npx prisma db push   (to create/sync the DB schema)
 *   3. DATABASE_URL must be set in .env
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const CSV_FILE = path.join(__dirname, "data", "colleges.csv");
const BATCH_SIZE = 500; // Insert in chunks to avoid memory/payload limits

async function main() {
  console.log("🚀  Starting seed …");

  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌  CSV not found at ${CSV_FILE}`);
    console.error("   Run: node generate_csv.js  first, then retry.");
    process.exit(1);
  }

  // 1. Clear existing data so re-seeding is idempotent
  console.log("🗑️   Clearing existing College records …");
  await prisma.college.deleteMany({});
  console.log("   Done.");

  // 2. Read CSV into memory
  const records = await new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on("data", (row) => {
        const percentile = parseFloat(row.percentile);
        const year = parseInt(row.year, 10);

        if (!row.name || !row.branch || !row.category) return; // skip bad rows
        if (isNaN(percentile) || percentile <= 0) return;

        rows.push({
          name:       row.name.trim(),
          branch:     row.branch.trim(),
          percentile: percentile,
          category:   row.category.trim(),
          city:       (row.city || "").trim(),
          year:       isNaN(year) ? 2025 : year,
        });
      })
      .on("end", () => resolve(rows))
      .on("error", (err) => reject(err));
  });

  console.log(`📋  Parsed ${records.length} records from CSV`);

  if (records.length === 0) {
    console.error("❌  No valid data found – check your CSV or re-run generate_csv.js");
    process.exit(1);
  }

  // 3. Batch insert
  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await prisma.college.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += batch.length;
    process.stdout.write(`   Inserted ${inserted}/${records.length} …\r`);
  }

  console.log(`\n✅  Successfully inserted ${inserted} records into College table!`);

  // 4. Verify
  const count = await prisma.college.count();
  console.log(`📊  Total rows in College table: ${count}`);

  const branches = await prisma.college.findMany({ select: { branch: true }, distinct: ["branch"] });
  const categories = await prisma.college.findMany({ select: { category: true }, distinct: ["category"] });
  console.log(`🌿  Unique branches  : ${branches.length}`);
  console.log(`🏷️   Unique categories: ${categories.length}`);
}

main()
  .catch((err) => {
    console.error("❌  Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());