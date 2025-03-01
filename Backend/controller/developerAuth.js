const {auth,db} = require('../config/firebase');
const {createUserWithEmailAndPassword , signInWithEmailAndPassword } = require('firebase/auth');
const { setDoc, doc } = require("firebase/firestore");