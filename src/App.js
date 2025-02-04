import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { FaInstagram, FaYoutube } from "react-icons/fa";


function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

  // ✅ Scroll to bottom when messages update
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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

    const userMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      //const response = await fetch("http://127.0.0.1:5000/chat", {
	const response = await fetch("https://carnivora-backend.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const aiMessage = { sender: "AI", text: data.response };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      setMessages((prevMessages) => [...prevMessages, { sender: "AI", text: "Erro: Não foi possível conectar ao AI." }]);
    }

    setIsTyping(false);
  };

  return (
    <div style={{
      maxWidth: "600px", margin: "auto", padding: "20px", fontFamily: "Arial",
      backgroundColor: "#f4f4f4", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)"
    }}>
      <div style={{
        border: "1px solid #ccc", padding: "10px", height: "350px", overflowY: "auto", backgroundColor: "#fff",
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
          }}>
            {msg.text}
          </div>
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
	    
		{/* Redes Sociais - Ícones com Links */}
		<div style={{
		  marginTop: "15px",
		  textAlign: "center"
		}}>
		  <h5 style={{ textAlign: "center", color: "#333", marginBottom: "10px" }}>
			Siga nossas redes sociais:
		  </h5>
		  <div style={{
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			gap: "15px"
		  }}>
			<a href="https://www.instagram.com/dietacarnivorabrasil"
			   target="_blank"
			   rel="noopener noreferrer"
			   style={{ fontSize: "30px", color: "#C13584" }}>
			  <FaInstagram />
			</a>
			<a href="https://www.youtube.com/@dietacarnivorabrasil4455"
			   target="_blank"
			   rel="noopener noreferrer"
			   style={{ fontSize: "30px", color: "#FF0000" }}>
			  <FaYoutube />
			</a>
		  </div>
		</div>
		
		{/* Rodapé - Copyright */}
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
