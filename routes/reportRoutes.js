const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/productivity", reportController.productivityDashboard);
router.get("/user-performance", reportController.userPerformanceReport);

module.exports = router;