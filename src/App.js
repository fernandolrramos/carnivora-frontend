import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { FaInstagram, FaYoutube } from "react-icons/fa";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState(null);
  const chatRef = useRef(null);

  // ✅ Get user_id from Wix backend
  useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const user_id = urlParams.get("user_id");
      if (user_id) {
          console.log("✅ Retrieved User ID from Wix:", user_id);
          setUserId(user_id);
      } else {
          console.warn("⚠️ No user ID found in URL.");
      }
  }, []);

  // ✅ Doesnt scroll to bottom when messages update
  useEffect(() => {
    if (chatRef.current && !isTyping) {  
      chatRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, isTyping]);

  // ✅ Automatically send a welcome message when the chat loads
  useEffect(() => {
    const welcomeMessage = {
      sender: "AI",
      text: "Seja bem-vindo! 🥩 Eu sou a inteligência artificial do Dieta Carnívora Brasil. Como posso te ajudar hoje?"
    };
    setMessages([welcomeMessage]); // Set initial welcome message
  }, []); // Runs only once when component mounts

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (!userId) {
      setMessages((prevMessages) => [...prevMessages, { sender: "AI", text: "⚠️ Você precisa estar logado para usar o chat." }]);
      return;
    }

    const userMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch("https://carnivora-backend.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, message: input }),
      });

      const data = await response.json();
      const aiMessages = data.response
        .split(/\n+/)  // Split by newlines
        .map((sentence, index) => {
          const formattedSentence = sentence.trim();
          return { sender: "AI", text: formattedSentence };
        })
        .filter((msg) => msg.text.length > 0);

      setMessages((prevMessages) => [
        ...prevMessages, 
        ...aiMessages
      ]);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      setMessages((prevMessages) => [...prevMessages, { sender: "AI", text: "Erro: Não foi possível conectar ao AI. Atualize a página. Se o erro persistir contate: carnivoros.br@gmail.com" }]);
    }

    setIsTyping(false);
  };

  return (
    <div style={{
      maxWidth: "600px", margin: "auto", padding: "20px", fontFamily: "Arial",
      backgroundColor: "#f4f4f4", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)"
    }}>
      <div style={{
        border: "1px solid #ccc", padding: "10px", height: "500px", minHeight: "500px",
        maxHeight: "80vh", overflowY: "auto", backgroundColor: "#fff",
        borderRadius: "5px", display: "flex", flexDirection: "column"
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
            margin: "5px 0",
            padding: "10px",
            borderRadius: "10px",
            maxWidth: "75%",
            backgroundColor: msg.sender === "user" ? "#007bff" : "#28a745",
            color: "#fff"
          }}
            dangerouslySetInnerHTML={{ __html: msg.text }} // Render HTML content
          />
        ))}
        {isTyping && (
          <div style={{
            alignSelf: "flex-start", margin: "5px 0", padding: "10px", borderRadius: "10px",
            maxWidth: "75%", backgroundColor: "#ddd", color: "#333"
          }}>
            IA está escrevendo...
          </div>
        )}
        <div ref={chatRef}></div>
      </div>

      <div style={{ display: "flex", marginTop: "10px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
          style={{
            flexGrow: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc"
          }}
          placeholder="Pergunte sobre a dieta carnívora..."
        />
        <button onClick={sendMessage} style={{
          padding: "10px 15px", marginLeft: "5px", backgroundColor: "#007bff",
          color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer"
        }}>Enviar</button>
      </div>
    </div>
  );
}

export default App;
