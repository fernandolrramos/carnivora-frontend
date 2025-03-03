import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { FaInstagram, FaYoutube } from "react-icons/fa";

// ✅ Use Wix window object (no need to install wix-users)
const getUserEmail = async () => {
  try {
    const user = window.wixUsers?.currentUser;
    if (!user || !user.loggedIn) {
      console.warn("⚠️ User is not logged in!");
      return null;
    }
    return await user.getEmail();
  } catch (error) {
    console.error("❌ Error fetching user email:", error);
    return null;
  }
};

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);
  const [userId, setUserId] = useState(null); // ✅ Store user ID from Wix

  // ✅ Fetch Wix User Email when Component Mounts
  useEffect(() => {
    getUserEmail().then(email => {
      if (email) {
        console.log("✅ User ID (Email):", email);
        setUserId(email); // ✅ Store User ID
      }
    });
  }, []);

  // ✅ Auto-scroll behavior
  useEffect(() => {
    if (chatRef.current && !isTyping) {  
      chatRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, isTyping]);

  // ✅ Automatically send a welcome message
  useEffect(() => {
    setMessages([{ sender: "AI", text: "Seja bem-vindo! 🥩 Como posso te ajudar hoje?" }]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (!userId) {
      console.error("❌ Error: Usuário não identificado.");
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
        body: JSON.stringify({
          user_id: userId, // ✅ Send Wix user email as ID
          message: input
        }),
      });

      const data = await response.json();
      const aiMessages = data.response
        .split(/\n+/) 
        .map((sentence) => ({ sender: "AI", text: sentence.trim() }))
        .filter((msg) => msg.text.length > 0);

      setMessages((prevMessages) => [...prevMessages, ...aiMessages]);
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
            dangerouslySetInnerHTML={{ __html: msg.text }} 
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

      <footer style={{
        marginTop: "20px",
        textAlign: "center",
        fontSize: "14px",
        color: "#aaa",
        padding: "10px 0"
      }}>
        © {new Date().getFullYear()} Dieta Carnívora Brasil. Todos os direitos reservados.
      </footer>
    </div>
  );
}

export default App;
