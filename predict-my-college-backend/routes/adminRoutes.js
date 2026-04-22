const express = require("express");
const router  = express.Router();
const { requireAdmin } = require("../middleware/authMiddleware");
const adminController  = require("../controllers/adminController");

// All admin routes are protected by requireAdmin middleware
router.get("/dashboard",       requireAdmin, adminController.getDashboardStats);
router.get("/users",           requireAdmin, adminController.getAllUsers);
router.get("/activity",        requireAdmin, adminController.getActivity);
router.get("/reviews",         requireAdmin, adminController.getAllReviews);
router.delete("/reviews/:id",  requireAdmin, adminController.deleteReview);

module.exports = router;
