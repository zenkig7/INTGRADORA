import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  "projectId": "roverview-bie3m",
  "appId": "1:164196588245:web:382473bddf068769ee205c",
  "storageBucket": "roverview-bie3m.firebasestorage.app",
  "apiKey": "AIzaSyDZ3Ha4VyFPfS8pi8DXELFeJ-_ESUgX4CI",
  "authDomain": "roverview-bie3m.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "164196588245"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export default app;
