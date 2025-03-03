const { db } = require('../config/firebase');
const { getDocs, collection, doc, setDoc, writeBatch, updateDoc, arrayUnion,getDoc } = require("firebase/firestore");
const pdfparse = require('pdf-parse');
const axios = require('axios');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require("@google/generative-ai");
dotenv.config();

const createTask = async (req, res) => {
    const { task, pdf, deadline, uid } = req.body;
    if (!task || !pdf || !deadline) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
  
    try {
      // Step 1: Fetch the PDF from Cloudinary and parse it
      const response = await axios.get(pdf, { responseType: "arraybuffer" });
      const parsedData = await pdfparse(response.data);
      const extractedText = parsedData.text;
  
      // Step 2: Fetch available developers
      const developersSnapshot = await getDocs(collection(db, "developers"));
      let availableDevelopers = [];
  
      developersSnapshot.forEach((doc) => {
        let devData = doc.data();
        if (devData.available) {
          try {
            devData.skills = JSON.parse(
              devData.skills.replace(/```json|```/g, "")
            );
          } catch (error) {
            console.error("Error parsing skills JSON:", error);
            devData.skills = { technical_skills: {} }; // Default skills object if parsing fails
          }
          availableDevelopers.push({ uid: doc.id, email: devData.email, ...devData });
        }
      });
  
      console.log("Available Developers:", availableDevelopers);
  
      if (availableDevelopers.length < 2) {
        return res.status(400).json({ message: "No team is available currently." });
      }
  
      // Step 3: Prepare request for Gemini API
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
      const geminiPrompt = `
        You are assigning developers to a task.
        TASK:
        - Name: ${task}
        - Description: ${extractedText.substring(0, 500)}... (truncated for brevity)
        - Deadline: ${deadline}
        AVAILABLE DEVELOPERS:
        ${availableDevelopers
          .map(
            (dev) =>
              `- ID: ${dev.uid}, Name: ${dev.name}, Email: ${dev.email}, Skills: ${JSON.stringify(
                dev.skills.technical_skills || {}
              )}`
          )
          .join("\n")}
        INSTRUCTIONS:
        - Return ONLY a JSON array with this format (no explanation, no markdown):
        - Return the developers list with highest fit for the task to lowest fit order.
        - Do not return any developer if none has matching skills strictly with the task (unless you think they can manage some part of the task, then include them).
        [{"uid": "developer-id", "name": "developer-name", "email": "developer-email"}]`;
  
      console.log("Sending prompt to Gemini:", geminiPrompt);
  
      const geminiResponse = await model.generateContent(geminiPrompt);
      const responseText = geminiResponse.response.text();
  
      console.log("Gemini Response:", responseText);
  
      let cleanedResponse = responseText.replace(/```json|```/g, "").trim();
      const jsonMatch = cleanedResponse.match(/\[.*\]/s);
  
      let assignedDevelopers = [];
      if (jsonMatch) {
        try {
          assignedDevelopers = JSON.parse(jsonMatch[0]);
          console.log("Parsed assigned developers:", assignedDevelopers);
        } catch (error) {
          console.error("Failed to parse Gemini API response:", error);
          console.log("Response text:", responseText);
        }
      }
  
      if (assignedDevelopers.length > 4) {
        assignedDevelopers = assignedDevelopers.slice(0, 4);
      }
  
      console.log("Final Assigned Developers (pre-map):", assignedDevelopers);
  
      // Map Gemini response to actual available developers
      assignedDevelopers = assignedDevelopers.map((dev) => {
        const matchedDev = availableDevelopers.find((availDev) => availDev.uid === dev.uid);
        if (matchedDev) {
          return {
            uid: matchedDev.uid,
            name: matchedDev.name,
            email: matchedDev.email,
          };
        } else {
          const fallbackDev = availableDevelopers[0];
          return {
            uid: fallbackDev.uid,
            name: fallbackDev.name,
            email: fallbackDev.email,
          };
        }
      });
  
      // NEW: Check if assignedDevelopers is empty after processing
      if (assignedDevelopers.length === 0) {
        return res.status(400).json({ message: "No team is available currently." });
      }
  
      console.log("Mapped Assigned Developers:", assignedDevelopers);
  
      // Step 4: Update developer availability in Firestore
      const batch = writeBatch(db);
      assignedDevelopers.forEach((dev) => {
        const devRef = doc(db, "developers", dev.uid);
        batch.update(devRef, { available: false });
      });
      await batch.commit();
  
      // Step 5: Store Task Data in Firestore
      const taskDocRef = doc(collection(db, "tasks"));
      await setDoc(taskDocRef, {
        task,
        pdf,
        deadline,
        text: extractedText,
        assignedDevelopers: assignedDevelopers.map((dev) => ({
          uid: dev.uid,
          email: dev.email,
          name: dev.name,
        })),
        createdAt: new Date().toISOString(),
      });
  
      // Step 6: Update Manager's Tasks array with the new task ID
      const managerRef = doc(db, "managers", uid); // Manager's UID is provided in the request body
      await updateDoc(managerRef, {
        tasks: arrayUnion(taskDocRef.id), // Adds the task ID to the tasks array
      });
  
      res.status(200).json({
        message: "Task Created Successfully",
        assignedDevelopers,
        teamSize: assignedDevelopers.length,
      });
    } catch (error) {
      console.error("Error in task creation:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
  

const getmanagersTasks = async (req,res) => {
    const { uid } = req.body;
    try{
        const managerRef = doc(db, "managers", uid);
        const managerSnap = await getDoc(managerRef);
        if (!managerSnap.exists()) {
            return res.status(404).json({ message: "Manager not found" });
        }

        const managerData = managerSnap.data();
        const tasks = [];
        for (const taskId of managerData.tasks) {
            const taskRef = doc(db, "tasks", taskId);
            const taskSnap = await getDoc(taskRef);
            if (taskSnap.exists()) {
                tasks.push({ id: taskId, ...taskSnap.data() });
            }
        }

        res.status(200).json({ tasks });
    }catch(error){
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }   
}

const getDevelopersTask = async (req,res) => {

}
module.exports = { createTask,getmanagersTasks,getDevelopersTask};
