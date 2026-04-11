import apibackend from "../apibackend";

apibackend();

const askAI = async (prompt) => {
  const selectedAI = JSON.parse(localStorage.getItem("selectedAI")) || {};
 console.log("selectedAI localStorage:", selectedAI); 
  try {
    const response = await fetch(`${apibackend}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        command: prompt,        // ✅ command bhejo messages nahi
        aiName: selectedAI.name,
      }),
    });

    const data = await response.json();
    console.log("AI Response:", data);
    return data; // ✅ BAS YAHI FIX HAI — return karo
    
  } catch (error) {
    console.log("Error:", error);
    return null;
  }
};

export default askAI;