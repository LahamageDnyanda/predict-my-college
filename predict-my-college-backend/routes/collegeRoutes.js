const express = require("express");
const router  = express.Router();

const {
  predictCollege,
  getOptions,
  getCutoffsByYear,
  getCollegeDetail,
  subscribeNewsletter,
} = require("../controllers/collegeController");

const { requireAuth } = require("../middleware/authMiddleware");

router.post("/predict",           requireAuth, predictCollege);
router.post("/subscribe",         subscribeNewsletter);
router.get("/options",            getOptions);
router.get("/cutoffs/:year",      getCutoffsByYear);
router.get("/college/:name",      getCollegeDetail);   // NEW: college detail page

module.exports = router;