# 🎥 VideoHub99 - সম্পূর্ণ সেটআপ গাইড

আপনার **VideoHub** প্রজেক্টটি এখন রিয়েল-টাইম সার্ভারের সাথে সম্পূর্ণভাবে সংযুক্ত।

## 📁 ফোল্ডার স্ট্রাকচার

```
Videohub99/
├── server.js                 # 🚀 মূল সার্ভার ফাইল
├── package.json             # নোড প্যাকেজ ফাইল
├── .env                     # পরিবেশ ভেরিয়েবল
├── src/
│   ├── App.jsx             # নতুন React অ্যাপ (সার্ভার সংযুক্ত)
│   ├── main.jsx            # Vite এন্ট্রি পয়েন্ট
│   └── index.css           # স্টাইল
├── public/                 # Vite নির্মাণ আউটপুট
└── vite.config.js          # Vite কনফিগুরেশন
```

## 🚀 দ্রুত স্টার্ট (তিনটি স্টেপ)

### **স্টেপ ১: নোড ডিপেন্ডেন্সি ইনস্টল করুন**

```bash
cd /workspaces/Videohub99
npm install
```

### **স্টেপ ২: সার্ভার চালু করুন**

```bash
npm start
```

আউটপুট দেখবেন:
```
🎥 VideoHub Server running on http://localhost:5000
📡 Socket.io ready for real-time updates
```

### **স্টেপ ৩: ব্রাউজারে যান**

```
http://localhost:5000
```

---

## 🔌 সার্ভার API রেফারেন্স

### **ভিডিও Management**

#### সব ভিডিও পান
```bash
GET /api/videos
```

#### নতুন ভিডিও যোগ করুন
```bash
POST /api/videos
Content-Type: application/json

{
  "url": "https://example.com/video.mp4",
  "title": "ভিডিওর নাম",
  "desc": "ভিডিওর বিবরণ",
  "author": "আপনার নাম"
}
```

#### ভিডিও লাইক করুন
```bash
POST /api/videos/:videoId/like
Content-Type: application/json

{
  "userId": "ব্যবহারকারী নাম"
}
```

#### ভিডিও ডিলিট করুন (শুধু Admin/লেখক)
```bash
DELETE /api/videos/:videoId
Content-Type: application/json

{
  "userId": "Admin_নাম"
}
```

### **ব্যবহারকারী Management**

#### নতুন ব্যবহারকারী রেজিস্ট্রেশন
```bash
POST /api/users/register
Content-Type: application/json

{
  "name": "আপনার নাম"
}
```

#### সব ব্যবহারকারী পান
```bash
GET /api/users
```

#### ব্যবহারকারী ডিলিট করুন (শুধু Admin)
```bash
DELETE /api/users/:userName
Content-Type: application/json

{
  "adminId": "Jpro95"
}
```

---

## 🔄 রিয়েল-টাইম ইভেন্ট (Socket.io)

আপনার অ্যাপে স্বয়ংক্রিয়ভাবে এই ইভেন্টগুলি শোনা হয়:

```javascript
// নতুন ভিডিও আসে
socket.on('video:new', (video) => {
  // UI আপডেট করুন
});

// লাইক কাউন্ট আপডেট হয়
socket.on('video:like-updated', ({ videoId, userId, liked }) => {
  // লাইক কাউন্ট আপডেট করুন
});

// ভিডিও ডিলিট হয়েছে
socket.on('video:deleted', ({ videoId }) => {
  // ভিডিও লিস্ট থেকে সরান
});

// নতুন ব্যবহারকারী যোগ হয়েছে
socket.on('user:registered', (user) => {
  // সদস্য সংখ্যা আপডেট করুন
});
```

---

## 🛠️ পরিবেশ ভেরিয়েবল (`.env`)

```env
PORT=5000                    # সার্ভার পোর্ট
NODE_ENV=development         # ডেভেলপমেন্ট মোড
ADMIN_PASSWORD=Jpro95       # Admin পাসওয়ার্ড (Admin হওয়ার জন্য এই নাম ব্যবহার করুন)
```

---

## 🌐 CORS এবং নেটওয়ার্ক সেটিংস

সার্ভার সব অরিজিনের থেকে কানেকশন গ্রহণ করে। যদি নিরাপত্তা সেটিংস পরিবর্তন করতে চান:

**`server.js` লাইন ~20:**
```javascript
const io = new SocketIO(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5000"],  // নির্দিষ্ট অরিজিন যোগ করুন
    methods: ["GET", "POST"]
  }
});
```

---

## 🔐 Admin অ্যাক্সেস পান

লগইন করার সময় এই নাম ব্যবহার করুন:
```
Jpro95
```

আপনি স্বয়ংক্রিয়ভাবে **Admin Control Panel** অ্যাক্সেস পাবেন যেখানে আপনি:
- সব ভিডিও ম্যানেজ করতে পারবেন
- সব ব্যবহারকারী দেখতে পারবেন
- GitHub থেকে ভিডিও ইমপোর্ট করতে পারবেন

---

## 📱 Frontend ভেরিয়েবল

`src/App.jsx` এ Socket.io কানেকশন:

```javascript
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
```

Vite এনভায়রনমেন্ট ভেরিয়েবল ব্যবহার করতে `.env.local` ফাইল তৈরি করুন:

**.env.local**
```
VITE_API_URL=http://localhost:5000
```

---

## 🚢 প্রোডাকশনে ডিপ্লয় করার জন্য

### Heroku এ
```bash
git push heroku main
```

### Railway/Render এ
- `server.js` কে আপনার মূল ফাইল বানান
- PORT এনভায়রনমেন্ট ভেরিয়েবল সেট করুন

### Azure/GCP/AWS এ
```bash
npm install
npm start
```

---

## 🐛 সমস্যা সমাধান

### সার্ভার কানেক্ট হচ্ছে না?
```bash
# পোর্ট চেক করুন
lsof -i :5000

# সব ডিপেন্ডেন্সি পুনরায় ইনস্টল করুন
rm -rf node_modules package-lock.json
npm install
```

### রিয়েল-টাইম আপডেট হচ্ছে না?
- ব্রাউজার কনসোল চেক করুন (F12 → Console)
- Socket.io সংযোগ যাচাই করুন

---

## 📝 পরবর্তী ধাপ

1. **Database Integration**: MongoDB/PostgreSQL যোগ করুন ডাটা persistent করতে
2. **Authentication**: JWT টোকেন যোগ করুন নিরাপত্তার জন্য
3. **File Upload**: সরাসরি ভিডিও আপলোড ফিচার যোগ করুন
4. **Search Optimization**: Elasticsearch যোগ করুন আরো ভালো সার্চের জন্য

---

## ✨ প্রশ্ন বা সমস্যা হলে

সার্ভার লগ দেখুন এবং বলুন কি এরর আসছে।

Happy Coding! 🚀
