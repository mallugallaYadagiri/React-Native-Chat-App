// // import {firebase} from '@react-native-firebase/firestore';
// import {initializeApp} from 'firebase/app';
// // import {getDatabase} from 'firebase/database';
// import {getFirestore} from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: 'AIzaSyCWCRRMj6XPXz6k9PYwkDEAITvhB4Mlgb4',
//   authDomain: 'mynewapp-df37f.firebaseapp.com',
//   projectId: 'mynewapp-df37f',
//   storageBucket: 'mynewapp-df37f.appspot.com',
//   messagingSenderId: '905610293231',
//   appId: '1:905610293231:web:2f7d7f2f1f7d7f2f',
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// // console.log(db);
// export default db;

import {initializeApp} from 'firebase/app';
import {getDatabase} from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyCWCRRMj6XPXz6k9PYwkDEAITvhB4Mlgb4',
  authDomain: 'mynewapp-df37f.firebaseapp.com',
  projectId: 'mynewapp-df37f',
  storageBucket: 'mynewapp-df37f.appspot.com',
  messagingSenderId: '905610293231',
  appId: '1:905610293231:web:2f7d7f2f1f7d7f2f',
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(
  app,
  'https://mynewapp-df37f-default-rtdb.asia-southeast1.firebasedatabase.app/',
);
// console.log(db);
export default db;
