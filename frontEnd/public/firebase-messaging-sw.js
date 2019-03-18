importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');
import {messagingSenderId} from '../environment'

firebase.initializeApp({
    messagingSenderId: messagingSenderId    
});
const messaging = firebase.messaging();