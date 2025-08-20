# ⚙️ LMS Backend

The **backend API** for the Learning Management System (LMS).  
Built with **Node.js, Express.js, and MongoDB**, this backend provides secure authentication, course management, order handling, and payment integration.

---

## 🌟 Key Features

- 🔐 **Authentication & Security**
  - JWT-based authentication (access + refresh tokens).
  - Secure password hashing with bcrypt.
  - Role-based access control.

- 📚 **Course Management**
  - Create, update, and delete courses, modules, and lectures.
  - Track lecture completion and course progress.
  - Media storage with **Cloudinary**.

- 👥 **User & Order Management**
  - Manage users, roles, and course enrollments.
  - Track orders and transactions.

- 💳 **Payment Integration**
  - **SSLCommerz Payment Gateway** integration for secure transactions.

- 🗄️ **Database**
  - MongoDB + Mongoose schema design for scalability and performance.

---

## 🗂️ Database Schema

### **Users**
- `id`: string (PK)  
- `name`: string  
- `email`: string (unique)  
- `phone`: string (unique)  
- `password`: string (hashed)  
- `role`: enum(`student`, `admin`)  
- `createdAt`: Date  
- `updatedAt`: Date  

---

### **Course**
- `id`: string (PK)  
- `title`: string  
- `slug`: string (unique)  
- `price`: number  
- `discountedPrice`: number (optional)  
- `description`: string  
- `thumbnail`: string  
- `coverPhoto`: string  
- `duration`: number (minutes)  
- `totalSeat`: number  
- `availableSeat`: number  
- `tags`: [string] (SEO optimization)  
- `learningPoints`: [string] (skills students learn)  
- `requirements`: [string] (prerequisites)  
- `instructor`: ObjectId (→ User)  
- `status`: enum(`upcoming`, `drafted`, `published`, `unpublished`)  
- `modules`: [Module] (1-to-many relation)  
- `createdAt`: Date  
- `updatedAt`: Date  

---

### **Module**
- `id`: string (PK)  
- `courseId`: string (FK → Course.id)  
- `moduleNumber`: number (auto increment)  
- `title`: string  
- `lectures`: [Lecture] (1-to-many relation)  
- `isFree`: boolean (if true → accessible without purchase)  
- `createdAt`: Date  
- `updatedAt`: Date  

---

### **Lecture**
- `id`: string (PK)  
- `title`: string  
- `content`: string  
- `contentType`: enum(`video`, `text`)  
- `moduleNumber`: number (auto increment)  
- `createdAt`: Date  
- `updatedAt`: Date  

---

### **Order**
- `id`: string (PK)  
- `amount`: number  
- `status`: enum(`complete`, `pending`, `processing`, `canceled`)  
- `payment`: ObjectId (→ Payment)  
- `user`: ObjectId (→ User)  
- `course`: ObjectId (→ Course)  

---

### **Payment**
- `id`: string (PK)  
- `amount`: number  
- `status`: enum(`complete`, `pending`, `failed`, `canceled`)  
- `gateway`: string (e.g., SSLCommerz)  
- `transactionId`: string (unique)  
- `user`: ObjectId (→ User)  
- `order`: ObjectId (→ Order)  

---

### **MyClass (User Watch History & Progress)**
- `id`: string (PK)  
- `user`: ObjectId (→ User)  
- `course`: ObjectId (→ Course)  
- `completedModule`: [] (array of completed modules)  
- `overallProgress`: number  
- `prevLecture`: ObjectId (previous lecture)  
- `currentLecture`: ObjectId (current lecture in progress)  
- `isCompleted`: boolean (whether course is completed)  
- `completedAt`: Date (completion timestamp)  

---


🚀 Run Project Locally
1. Clone the repository
```
git clone https://github.com/habibur-pro/LLM-backend
cd LLM-backend
```

2. Install dependencies
```yarn install```

3. Configure environment variables (.env)

Create a .env file in the root and add:
```
PORT=5000
DB_URI=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRES_IN=
REFRESH_TOKEN_EXPIRES_IN=
MAILER_NAME=
MAILER_PASS=
CLOUDINARY_CLOUD=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SSL_STORE_ID=
SSL_STORE_PASS=
IS_PAYMENT_LIVE=
FRONTEND_URL=
```

4. Start the development server
```yarn dev```

5. Open API locally

http://localhost:5000/api/v1

🌐 Live API

Backend Live URL: https://lmsapi.vercel.app/api/v1

🌐 Live Website

Live URL: https://llm-minimal.vercel.app/



🛠️ Technologies Used

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT (Authentication)
* Bcrypt (Password Hashing)
* Cloudinary (Media Uploads)
* SSLCommerz (Payment Gateway)

📌 Conclusion

This backend provides the core API and business logic for the LMS system — powering authentication, payments, and course progress.
It works seamlessly with the Frontend Repository
.


