const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files
const staticPath = path.join(__dirname);
app.use(express.static(staticPath));
app.use('/Admin', express.static(path.join(__dirname, 'Admin')));

// Test route
app.get('/test', (req, res) => {
  res.sendFile(path.join(staticPath, 'Admin/quanlytruyenchuong.html'));
});

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(
    require('./datn-1fc4c-firebase-adminsdk-fbsvc-fb57c139e4.json')
  ),
  databaseURL:
    'https://datn-1fc4c-default-rtdb.asia-southeast1.firebasedatabase.app',
});

console.log('✅ Firebase Admin đã kết nối thành công');

const firestore = admin.firestore();

// ==================== User APIs ====================

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const snapshot = await firestore.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách user:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/*
Test GET all users:
curl http://localhost:3000/api/users
*/

// Login check username and password
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const snapshot = await firestore
      .collection('users')
      .where('username', '==', username)
      .where('password', '==', password)
      .get();

    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0].data();
      res.json({ success: true, role: userDoc.role });
    } else {
      res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
    }
  } catch (err) {
    console.error('❌ Lỗi API /login:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/*
Test Login:
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"username\":\"test\",\"password\":\"123456\"}"
*/

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
app.get('/generate-otp', (req, res) => {
  const otp = generateOTP();
  console.log('📨 Mã OTP:', otp);
  res.json({ success: true, otp });
});

/*
Test Generate OTP:
curl http://localhost:3000/generate-otp
*/

// Firebase users list
app.get('/api/firebase-users', async (req, res) => {
  try {
    const listUsers = await admin.auth().listUsers();
    res.json(listUsers.users);
  } catch (err) {
    console.error('❌ Lỗi API /api/firebase-users:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/*
Test Firebase users:
curl http://localhost:3000/api/firebase-users
*/

// ==================== Mangas APIs ====================

// Get all mangas
app.get('/api/mangas', async (req, res) => {
  try {
    const snapshot = await firestore.collection('mangas').get();
    const mangas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(mangas);
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách manga:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/*
Test GET mangas:
curl http://localhost:3000/api/mangas
*/

// Add new manga
app.post('/api/mangas', async (req, res) => {
  try {
    const ref = await firestore.collection('mangas').add(req.body);
    res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error('❌ Lỗi thêm manga:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/*
Test Add manga:
curl -X POST http://localhost:3000/api/mangas -H "Content-Type: application/json" -d "{\"title\":\"One Piece\",\"author\":\"Eiichiro Oda\"}"
*/

// Delete manga by id
app.delete('/api/mangas/:id', async (req, res) => {
  try {
    await firestore.collection('mangas').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Lỗi xoá manga:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/*
Test Delete manga:
curl -X DELETE http://localhost:3000/api/mangas/{id}
*/

// Update manga by id
app.put('/api/mangas/:id', async (req, res) => {
  try {
    await firestore.collection('mangas').doc(req.params.id).update(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Lỗi cập nhật manga:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/*
Test Update manga:
curl -X PUT http://localhost:3000/api/mangas/{id} -H "Content-Type: application/json" -d "{\"author\":\"New Author\"}"
*/

// ==================== Genres APIs ====================

// Get all genres
app.get('/api/genres', async (req, res) => {
  try {
    const snapshot = await firestore.collection('genres').get();
    const genres = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(genres);
  } catch (err) {
    console.error('❌ Lỗi lấy genres:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/*
Test GET genres:
curl http://localhost:3000/api/genres
*/

// Add new genre
app.post('/api/genres', async (req, res) => {
  try {
    const ref = await firestore.collection('genres').add({
      ...req.body,
      createdAt: new Date(),
    });
    res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error('❌ Lỗi thêm genre:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/*
Test Add genre:
curl -X POST http://localhost:3000/api/genres -H "Content-Type: application/json" -d "{\"name\":\"Action\"}"
*/

// Delete genre by id
app.delete('/api/genres/:id', async (req, res) => {
  try {
    await firestore.collection('genres').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Lỗi xoá genre:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/*
Test Delete genre:
curl -X DELETE http://localhost:3000/api/genres/{id}
*/

// Update genre by id
app.put('/api/genres/:id', async (req, res) => {
  try {
    await firestore.collection('genres').doc(req.params.id).update(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Lỗi cập nhật genre:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/*
Test Update genre:
curl -X PUT http://localhost:3000/api/genres/{id} -H "Content-Type: application/json" -d "{\"name\":\"New Name\"}"
*/

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
});
