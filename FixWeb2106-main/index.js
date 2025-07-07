const admin = require('firebase-admin');

// Import file JSON service account
const serviceAccount = require('./config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://datn-1fc4c-default-rtdb.firebaseio.com',
});

const firestore = admin.firestore();

async function testFirestore() {
  try {
    // Thêm 1 document vào collection 'test'
    const docRef = await firestore.collection('test').add({
      hello: 'world',
      timestamp: new Date(),
    });
    console.log('Document written with ID:', docRef.id);

    // Đọc tất cả document trong collection 'test'
    const snapshot = await firestore.collection('test').get();
    snapshot.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });

    console.log('✅ Firestore connection test successful!');
  } catch (error) {
    console.error('❌ Error testing Firestore:', error);
  }
}

testFirestore();
