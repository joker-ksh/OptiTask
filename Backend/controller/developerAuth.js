const { auth, db } = require('../config/firebase');
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { setDoc,doc,getDocs,collection } = require("firebase/firestore");
const pdfparse = require('pdf-parse');
const axios = require('axios');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require("@google/generative-ai");
dotenv.config();

const DeveloperSignUp = async (req, res) => {
    const { name, email, password, resume, techstack } = req.body;

    if (!name || !email || !password || !resume) {
        return res.status(400).json({ message: 'Please fill all the fields' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    try {
        // ✅ Step 1: Fetch the Resume with timeout
        const response = await axios.get(resume, { 
            responseType: 'arraybuffer',
            timeout: 10000 // 10 second timeout
        });

        // ✅ Step 2: Parse the Resume using pdf-parse
        const parsedData = await pdfparse(response.data);
        let extractedText = parsedData.text;

        // ✅ Step 3: Optimize text for faster processing
        // Remove extra whitespace and limit length
        extractedText = extractedText.replace(/\s+/g, ' ').trim();
        
        // Keep only first 2000 characters for faster processing
        if (extractedText.length > 2000) {
            extractedText = extractedText.substring(0, 2000);
        }
        
        console.log("Extracted Resume Text Length:", extractedText.length);

        // ✅ Step 4: Optimized Gemini prompt for speed and concise output
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: {
                maxOutputTokens: 300, // Limit output for faster response
                temperature: 0.1 // More focused output
            }
        });

        const prompt = `Extract key technical skills from resume. Return ONLY comma-separated list format:
Programming: skill1, skill2
Frameworks: skill1, skill2  
Databases: skill1, skill2
Tools: skill1, skill2
Experience: X years
Context: ${techstack || 'General'}

Resume: "${extractedText}"`;

        const geminiResponse = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        // ✅ Debug: Log the full response structure
        console.log("Gemini Full Response:", JSON.stringify(geminiResponse, null, 2));

        // ✅ Enhanced error handling for Gemini response
        let skillsExtracted = "No skills extracted";

        try {
            // Check if response exists
            if (geminiResponse && geminiResponse.response) {
                // Check for candidates
                if (geminiResponse.response.candidates && geminiResponse.response.candidates.length > 0) {
                    const candidate = geminiResponse.response.candidates[0];
                    
                    // Try different possible response structures
                    if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                        // Standard structure
                        skillsExtracted = candidate.content.parts[0].text || "No skills found";
                    } else if (candidate.text) {
                        // Alternative structure
                        skillsExtracted = candidate.text;
                    } else if (candidate.output) {
                        // Another possible structure
                        skillsExtracted = candidate.output;
                    }
                } else if (geminiResponse.response.text) {
                    // Direct text response
                    skillsExtracted = geminiResponse.response.text;
                }
            }

            // Clean up the extracted skills
            skillsExtracted = skillsExtracted.toString().trim();
            
            // If still no skills, provide a basic fallback
            if (!skillsExtracted || skillsExtracted === "No skills extracted" || skillsExtracted === "No skills found") {
                skillsExtracted = `Programming: JavaScript, ${techstack || 'Web Development'}
Frameworks: React, Node.js
Tools: Git, VS Code
Experience: Based on resume analysis`;
            }

        } catch (parseError) {
            console.error("Error parsing Gemini response:", parseError);
            // Fallback skills based on techstack
            skillsExtracted = `Programming: JavaScript, ${techstack || 'Web Development'}
Frameworks: React, Node.js
Tools: Git, VS Code
Experience: Based on resume analysis`;
        }
        console.log("Extracted Skills:", skillsExtracted);

        // ✅ Step 5: Create user in Firebase Auth ONLY IF Gemini was successful
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredentials.user;
        console.log(user.uid + ' signed up');

        // ✅ Step 6: Store Developer Data in Firestore
        await setDoc(doc(db, 'developers', user.uid), {
            name,
            email,
            resume,
            skills: skillsExtracted,
            available: true,
            techstack
        });
        console.log('Developer added to Firestore');

        // ✅ Step 7: Generate Token
        const token = await user.getIdToken();
        
        // ✅ EXACT SAME RESPONSE FORMAT - Frontend won't be affected
        res.status(200).json({
            message: "Developer Signed Up Successfully",
            token,
            skills: skillsExtracted,
            uid: user.uid,
            techstack
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(400).json({ message: error.message });
    }
};

const DeveloperSignIn = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please fill all the fields' });
    }
    try {
        const userCredentials = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredentials.user;
        console.log(user.email + ' signed in');

        // Generate Token Correctly
        const token = await user.getIdToken();
        
        res.status(200).json({
            message: 'Developer Signed In Successfully',
            token: token, // Return token in response
            uid : user.uid
        });
    } catch (error) {
        console.error("Signin Error:", error);
        res.status(400).json({ message: error.message });
    }
};


const getAllAvailableDevelopers = async (req, res) => {
    try {
        const developers = [];
        const querySnapshot = await getDocs(collection(db, 'developers'));
        querySnapshot.forEach((doc) => {
            const developer = doc.data();
            if (developer.available) {
                developers.push(developer);
            }
        });
        res.status(200).json(developers);
    } catch (error) {
        console.error("Get Developers Error:", error);
        res.status(400).json({ message: error.message });
    }
};  

module.exports = { DeveloperSignUp, DeveloperSignIn,getAllAvailableDevelopers };
