const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/longestTasks", reportController.longestTasks);
router.get("/user-performance", reportController.userPerformanceReport);

module.exports = router;