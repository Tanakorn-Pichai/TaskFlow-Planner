// เรียกใช้งาน express
const express = require("express");

// สร้าง Router object
const router = express.Router();

// หน้าแรก (Home Page)
router.get("/", (req, res) => {

    // render ไฟล์ views/home.ejs
    res.render("home");

});

// export router ออกไปใช้ใน app.js
module.exports = router;