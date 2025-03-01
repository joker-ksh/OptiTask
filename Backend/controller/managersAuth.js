const {auth,db} = require('../config/firebase');
const {createUserWithEmailAndPassword , signInWithEmailAndPassword } = require('firebase/auth');
const { setDoc, doc } = require("firebase/firestore");

const ManagerSignUp = async (req,res) => {
  const {name,email,password} = req.body;
  if(!name || !email || !password){
    return res.status(400).json({message: 'Please fill all the fields'});
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }
  
  try {
    const userCredentials = await createUserWithEmailAndPassword(auth,email,password);
    const user = userCredentials.user;
    console.log(user + ' signed up');
    await setDoc(doc(db, 'managers', user.uid), {
      name: name,
      email: email
    });
    console.log('Manager added to Firestore');
    res.status(200).json({message: 'Manager Signed Up Successfully'});
  } catch (error) {
    res.status(400).json({message: error.message});
  }
}


const ManagerSignIn = async (req,res) => {
  const {email,password} = req.body;
  if(!email || !password){
    return res.status(400).json({message: 'Please fill all the fields'});
  }
  try {
    const userCredentials = await signInWithEmailAndPassword(auth,email,password);
    console.log(userCredentials.user.email + ' signed in');
    res.status(200).json({message: 'Manager Signed In Successfully'});
  } catch (error) {
    res.status(400).json({message: error.message});
  }
}

module.exports = {ManagerSignUp,ManagerSignIn};
