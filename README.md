# TaskFlow Planner

## 1. ชื่อโปรเจกต์

**TaskFlow Planner**

------------------------------------------------------------------------

## 2. คำอธิบายโปรเจกต์

TaskFlow Planner เป็นระบบจัดการงานและโปรเจกต์ (Project & Task Management
System) ที่ช่วยให้ผู้ใช้สามารถสร้างโปรเจกต์ เพิ่มงาน แก้ไข ลบ
และติดตามความคืบหน้าของงานได้อย่างเป็นระบบ

ภายในระบบมี **Dashboard สำหรับแสดงสถิติภาพรวมของงานและโปรเจกต์** พร้อมทั้งระบบ
**Reports** สำหรับวิเคราะห์ประสิทธิภาพการทำงานของผู้ใช้และทีม

ระบบรองรับการใช้งานหลายผู้ใช้ พร้อมการกำหนด **Role-based Access Control**
ระหว่าง **Admin และ User**

------------------------------------------------------------------------

## 3. เทคโนโลยีที่ใช้

-   Node.js
-   Express.js
-   EJS (Embedded JavaScript Templates)
-   Sequelize ORM
-   SQLite Database
-   bcrypt
-   express-session
-   Chart.js
-   Axios
-   Concurrently
-   Nodemon

------------------------------------------------------------------------

## 4. วิธีติดตั้ง

### 4.1 Clone โปรเจกต์จาก GitHub

git clone https://github.com/Tanakorn-Pichai/TaskFlow-Planner.git

### 4.2 เข้าโฟลเดอร์โปรเจกต์

cd TaskFlow-Planner

### 4.3 ติดตั้ง dependencies

npm install

------------------------------------------------------------------------

## 5. วิธีรันโปรแกรม

### 5.1 สร้างข้อมูลเริ่มต้นในฐานข้อมูล

npm run seed

### 5.2 รันโปรแกรมในโหมด Development

npm run dev

คำสั่งนี้จะรัน

-   Backend API (server.js)
-   Frontend Server (app.js)

พร้อมกันด้วย **concurrently**

เปิดใช้งานที่

http://localhost:5000

------------------------------------------------------------------------

## 6. รายการฟีเจอร์

### Authentication

-   ระบบ Login / Logout
-   ใช้ Session Authentication

### User Management

-   แยกสิทธิ์ Admin / User
-   CRUD Users (เฉพาะ Admin)

### Project Management

-   สร้างโปรเจกต์
-   แก้ไขโปรเจกต์
-   ลบโปรเจกต์
-   ดูรายละเอียดโปรเจกต์

### Task Management

-   เพิ่มงานในโปรเจกต์
-   แก้ไขงาน
-   ลบงาน
-   กำหนดผู้รับผิดชอบ
-   เปลี่ยนสถานะงาน

### Task Logs

-   บันทึกประวัติการเปลี่ยนแปลงของงาน
-   ตรวจสอบการแก้ไขย้อนหลังได้

### Dashboard

-   แสดงสถิติของระบบ
-   กราฟภาพรวมของโปรเจกต์และงาน
-   วิเคราะห์สถานะงาน

### Reports

-   รายงานสรุปงาน
-   วิเคราะห์ประสิทธิภาพการทำงาน
-   สรุปข้อมูลในรูปแบบกราฟ

------------------------------------------------------------------------

## 7. Screenshots

### Home (Dashboard)

`<img width="1879" height="867" src="https://github.com/user-attachments/assets/f24cd250-ace6-4bfd-a095-5ac4d1a37734" />`{=html}

### CRUD Users

`<img width="1855" height="834" src="https://github.com/user-attachments/assets/0cb5eee6-da50-4e55-8a1f-c09640905f71" />`{=html}

### CRUD Projects

`<img width="1878" height="860" src="https://github.com/user-attachments/assets/e96c85f1-cf86-4d27-a2f2-b27bcb49427b" />`{=html}

### CRUD Tasks

`<img width="1846" height="793" src="https://github.com/user-attachments/assets/b5950132-3c77-4496-8eca-64bbb683b8eb" />`{=html}

### Reports

`<img width="1863" height="647" src="https://github.com/user-attachments/assets/97c5d921-be7d-4502-b451-d1a07163f883" />`{=html}

`<img width="1830" height="812" src="https://github.com/user-attachments/assets/734de584-87f2-49c3-9401-b63b8fb3451c" />`{=html}
