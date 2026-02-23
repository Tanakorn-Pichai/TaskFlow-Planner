// ===============================
// เรียกใช้งาน Modules
// ===============================
const express = require('express');
const path = require('path');
// สร้าง express app
const app = express();


// ===============================
// ตั้งค่า View Engine
// ===============================

// กำหนดโฟลเดอร์ views
app.set("views", path.join(__dirname, "views"));

// ใช้ EJS เป็น template engine
app.set("view engine", "ejs");


// ===============================
// Static Files (CSS / JS)
// ===============================
app.use(express.static(path.join(__dirname, "public")));


// ===============================
// เรียกใช้ Routes
// ===============================

// import homeRoutes
const homeRoutes = require("./routes/homeRoutes");

// ใช้ route หน้าแรก
app.use("/", homeRoutes);


// ===============================
// เปิด Server
// ===============================
app.listen(5500, () => {
    console.log("Server started at http://localhost:5500");
});