const {auth,db} = require('../config/firebase');
const {createUserWithEmailAndPassword , signInWithEmailAndPassword } = require('firebase/auth');
const { setDoc, doc } = require("firebase/firestore");

const DeveloperSignUp = async (req,res) => {
    const {name,email,password,resume} = req.body;
    if(!name || !email || !password || !resume){
        return res.status(400).json({message: 'Please fill all the fields'});
    }
    
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    
    try {
        const userCredentials = await createUserWithEmailAndPassword(auth,email,password);
        const user = userCredentials.user;
        console.log(user + ' signed up');
        await setDoc(doc(db, 'developers', user.uid), {
            name: name,
            email: email,
            resume: resume
        });
        console.log('Developer added to Firestore');
        res.status(200).json({message: 'Developer Signed Up Successfully'});
    } catch (error) {
        res.status(400).json({message: error.message});
    }
};

const DeveloperSignIn = async (req,res) => {
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).json({message: 'Please fill all the fields'});
    }
    try {
        const userCredentials = await signInWithEmailAndPassword(auth,email,password);
        console.log(userCredentials.user.email + ' signed in');
        res.status(200).json({message: 'Developer Signed In Successfully'});
    } catch (error) {
        res.status(400).json({message: error.message});
    }
};



module.exports = {DeveloperSignUp,DeveloperSignIn};
