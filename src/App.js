import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { FaInstagram, FaYoutube } from "react-icons/fa";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

  // ✅ Prevent auto-scroll while user is typing
  useEffect(() => {
    if (chatRef.current && !isTyping) {  
      chatRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, isTyping]);

  // ✅ Welcome message on load
  useEffect(() => {
    setMessages([{ sender: "AI", text: "Seja bem-vindo! 🥩 Eu sou a inteligência artificial do Dieta Carnívora Brasil. Como posso te ajudar hoje?" }]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch("https://carnivora-backend.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const aiMessages = data.response
        .split(/\n+/)
        .map((sentence) => ({ sender: "AI", text: sentence.trim() }))
        .filter((msg) => msg.text.length > 0);

      setMessages((prevMessages) => [...prevMessages, ...aiMessages]);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "AI", text: "Erro: Não foi possível conectar ao AI. Atualize a página. Se o erro persistir contate: carnivoros.br@gmail.com" }
      ]);
    }

    setIsTyping(false);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", maxWidth: "600px", margin: "auto",
      padding: "20px", fontFamily: "Arial", backgroundColor: "#f4f4f4",
      borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)"
    }}>
      
      {/* Chat Messages Container */}
      <div style={{
        flexGrow: 1, overflowY: "auto", backgroundColor: "#fff",
        borderRadius: "5px", padding: "10px", display: "flex", flexDirection: "column"
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
            margin: "5px 0", padding: "10px", borderRadius: "10px",
            maxWidth: "75%", backgroundColor: msg.sender === "user" ? "#007bff" : "#28a745",
            color: "#fff"
          }}
            dangerouslySetInnerHTML={{ __html: msg.text }} 
          />
        ))}
        {isTyping && (
          <div style={{
            alignSelf: "flex-start", margin: "5px 0", padding: "10px",
            borderRadius: "10px", maxWidth: "75%", backgroundColor: "#ddd", color: "#333"
          }}>
            IA está escrevendo...
          </div>
        )}
        <div ref={chatRef}></div>
      </div>

      {/* Chat Input Box - Always Visible */}
      <div style={{
        display: "flex", padding: "10px",
        position: "sticky", bottom: 0, background: "#f4f4f4", width: "100%"
      }}>
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

      {/* Footer */}
      <footer style={{
        textAlign: "center", fontSize: "14px", color: "#aaa", padding: "10px 0"
      }}>
        © {new Date().getFullYear()} Dieta Carnívora Brasil. Todos os direitos reservados.
      </footer>
    </div>
  );
}

export default App;
