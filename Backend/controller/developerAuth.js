const {auth,db} = require('../config/firebase');
const {createUserWithEmailAndPassword , signInWithEmailAndPassword } = require('firebase/auth');
const { setDoc, doc } = require("firebase/firestore");
const pdfparse = require('pdf-parse');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const DeveloperSignUp = async (req,res) => {
    const {name,email,password,resume} = req.body;
    if(!name || !email || !password || !resume){
        return res.status(400).json({message: 'Please fill all the fields'});
    }
    
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    
    try {
        //Step 1: Create User in Firebase Auth
        const userCredentials = await createUserWithEmailAndPassword(auth,email,password);
        const user = userCredentials.user;
        console.log(user.uid + ' signed up');

        //Step 2: Fetch the Resume from the Cloudinary URL
        const response = await axios.get(resume, {responseType: 'arraybuffer'});


        //Step 3: Parse the Resume using pdf-parse
        const parsedData = await pdfparse(response.data);
        const extractedText = parsedData.text;
        console.log("Extracted Resume Text:", extractedText);

        //Step 4: Send Resume Text to Gemini API for Skill Extraction
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        You are an AI resume analyzer. Analyze the following resume text and extract technical skills.
        - Identify and categorize all technical skills (Programming, Cloud, Databases, etc.).
        - Rank skills based on experience, project involvement, and explicit mentions.
        - Provide experience duration (e.g., "React: 2 years").
        - Return output in structured JSON format.

        Resume Text:
        """${extractedText}"""
        `;

        const geminiResponse = await model.generateContent(prompt);
        const skillsExtracted = geminiResponse.response.text();

        console.log("Extracted Skills:", skillsExtracted);
        
        //Step 5: Store Developer Data in Firestore
        await setDoc(doc(db, 'developers', user.uid), {
            name: name,
            email: email,
            resume: resume,
            skills: skillsExtracted
        });
        console.log('Developer added to Firestore');
        res.status(200).json({ message: "Developer Signed Up Successfully", skills: skillsExtracted });
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
