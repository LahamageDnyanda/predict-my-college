/**
 * generate_csv.js
 * ---------------
 * Reads cap_2023_final.json, cap_2024_final.json, cap_2025_final.json
 * from the data_extraction folder and generates a flat colleges.csv
 * inside predict-my-college-backend/data/
 *
 * Each JSON record has:
 *   { institute_code, institute, choice_code, course, cutoffs: { stage_I_GOPENS: { percentile } } }
 *
 * We expand each cutoff category into its own row.
 */

const fs = require("fs");
const path = require("path");

// ─── Category Code → Friendly Name Mapping ────────────────────────────────
// Maharashtra MHT-CET CAP category codes explained:
//   G = Government quota  L = Ladies (women)
//   OPEN = General Open   OBC = OBC   SC = SC   ST = ST   VJ = Vimukta Jati
//   NT1/NT2/NT3 = Nomadic Tribes  EWS = EWS  TFWS = Tuition Fee Waiver Scheme
//   DEF = Defence  PWD = Persons with Disability  ORPHAN = Orphan
const CATEGORY_MAP = {
  // Stage I – Government Quota (G prefix)
  stage_I_GOPENS:    "OPEN",
  stage_I_GOBCS:     "OBC",
  stage_I_GSCS:      "SC",
  stage_I_GSTS:      "ST",
  stage_I_GVJS:      "VJ",
  stage_I_GNT1S:     "NT1",
  stage_I_GNT2S:     "NT2",
  stage_I_GNT3S:     "NT3",
  stage_I_EWS:       "EWS",
  stage_I_TFWS:      "TFWS",
  // Stage I – Ladies (women-only seats)
  stage_I_LOPENS:    "OPEN (Ladies)",
  stage_I_LOBCS:     "OBC (Ladies)",
  stage_I_LSCS:      "SC (Ladies)",
  stage_I_LSTS:      "ST (Ladies)",
  stage_I_LVJS:      "VJ (Ladies)",
  stage_I_LNT1S:     "NT1 (Ladies)",
  stage_I_LNT2S:     "NT2 (Ladies)",
  stage_I_LNT3S:     "NT3 (Ladies)",
  // Stage I – Defence / Defviji / PWD / Orphan
  stage_I_DEFOPENS:  "DEF OPEN",
  stage_I_DEFOBCS:   "DEF OBC",
  stage_I_DEFROBCS:  "DEF OBC (Rural)",
  stage_I_DEFRNT1S:  "DEF NT1 (Rural)",
  stage_I_DEFRNT2S:  "DEF NT2 (Rural)",
  stage_I_DEFRNT3S:  "DEF NT3 (Rural)",
  stage_I_PWDOPENS:  "PWD OPEN",
  stage_I_PWDOBCS:   "PWD OBC",
  stage_I_PWDROBC:   "PWD OBC (Rural)",
  stage_I_PWDRSCS:   "PWD SC (Rural)",
  stage_I_ORPHAN:    "Orphan",
  // Stage II cutoffs (same logic, just stage II)
  stage_II_DEFOPENS: "DEF OPEN (II)",
  stage_II_DEFOBCS:  "DEF OBC (II)",
  stage_II_EWS:      "EWS (II)",
  stage_II_LOPENS:   "OPEN Ladies (II)",
  stage_II_LOBCS:    "OBC Ladies (II)",
  stage_II_LSCS:     "SC Ladies (II)",
  stage_II_LSTS:     "ST Ladies (II)",
  stage_II_LVJS:     "VJ Ladies (II)",
  stage_II_LNT1S:    "NT1 Ladies (II)",
  stage_II_LNT2S:    "NT2 Ladies (II)",
  stage_II_LNT3S:    "NT3 Ladies (II)",
  stage_II_TFWS:     "TFWS (II)",
};

// Helper: extract city from institute name (often ends with ", City")
function extractCity(instituteName) {
  if (!instituteName) return "";
  // Common patterns: "…, Pune", "…, Mumbai", "…, Nagpur", etc.
  const match = instituteName.match(/,\s*([^,]+)\s*$/);
  return match ? match[1].trim() : "";
}

// Helper: escape CSV field
function csvField(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ─── Main ──────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, "..", "data_extraction");
const OUT_FILE = path.join(__dirname, "data", "colleges.csv");
const YEARS = [2023, 2024, 2025];

const rows = [];

for (const year of YEARS) {
  const filePath = path.join(DATA_DIR, `cap_${year}_final.json`);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath} – skipping year ${year}`);
    continue;
  }

  console.log(`📂 Reading cap_${year}_final.json …`);
  const raw = fs.readFileSync(filePath, "utf8");
  let records;

  try {
    const parsed = JSON.parse(raw);
    // Handle both array-at-root and { data: [...] } shapes
    records = Array.isArray(parsed) ? parsed : parsed.data || [];
  } catch (e) {
    console.error(`❌ Failed to parse ${filePath}:`, e.message);
    continue;
  }

  console.log(`   → ${records.length} records loaded for ${year}`);

  let rowsThisYear = 0;

  for (const record of records) {
    const institute = record.institute || record.college_name || "";
    const course = record.course || record.branch || "";
    const city = extractCity(institute);

    if (!record.cutoffs || typeof record.cutoffs !== "object") continue;

    for (const [code, data] of Object.entries(record.cutoffs)) {
      const friendlyCategory = CATEGORY_MAP[code];
      if (!friendlyCategory) continue; // skip unmapped codes

      const percentile = parseFloat(data.percentile);
      if (isNaN(percentile) || percentile <= 0) continue;

      rows.push({
        name: institute,
        branch: course,
        percentile,
        category: friendlyCategory,
        city,
        year,
      });
      rowsThisYear++;
    }
  }

  console.log(`   → ${rowsThisYear} rows generated for ${year}`);
}

// ─── Write CSV ─────────────────────────────────────────────────────────────
const header = "name,branch,percentile,category,city,year";
const lines = rows.map(
  (r) =>
    `${csvField(r.name)},${csvField(r.branch)},${r.percentile},${csvField(r.category)},${csvField(r.city)},${r.year}`
);

fs.writeFileSync(OUT_FILE, [header, ...lines].join("\n"), "utf8");

console.log("\n✅  CSV generation complete!");
console.log(`   Total rows  : ${rows.length}`);
console.log(`   Output file : ${OUT_FILE}`);
