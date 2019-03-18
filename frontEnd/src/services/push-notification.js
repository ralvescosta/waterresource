import firebase from 'firebase';
import {messagingSenderId} from '../environment'

export const inicializerFirebase = () => {

    firebase.initializeApp({
        messagingSenderId: messagingSenderId
    });

    if('serviceWorker' in navigator){

        navigator.serviceWorker
            .register('/sw.js')
            .then((registration)=>{
                firebase.messaging().useServiceWorker(registration);
            }); 
    }
}
export const notificationPermission = async () => {
    try {
      const messaging = firebase.messaging();
      await messaging.requestPermission();
      const token = await messaging.getToken();
      return token;
    } catch (error) {
      console.error(error);
    }
  }