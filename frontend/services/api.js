// Ye file Backend se baat karegi
export const chatWithNiti = async (message) => {
  try {
    const res = await fetch('https://niti-backend.onrender.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });

    const data = await res.json();
    return data.response || "Sorry, I couldn't understand that.";
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Network connection failed.");
  }
};