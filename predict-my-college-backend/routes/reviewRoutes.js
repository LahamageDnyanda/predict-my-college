const express = require("express");
const router  = express.Router();
const { createReview, getReviews, deleteReview } = require("../controllers/reviewController");
const { requireAdmin, requireAuth } = require("../middleware/authMiddleware");

router.get("/",         requireAuth, getReviews);            
router.post("/",        requireAuth, createReview);          
router.delete("/:id",   requireAdmin, deleteReview);         

module.exports = router;
