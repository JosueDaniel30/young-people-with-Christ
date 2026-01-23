
/**
 * EJEMPLO DE BACKEND SEGURO (Node.js + Express)
 * 
 * Este archivo NO se ejecuta en el navegador. 
 * Se debe subir a un servidor (Vercel, Railway, Render, etc.)
 */

/*
const express = require('express');
const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(express.json());

// La API KEY se configura en las variables de entorno del servidor
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/ignite-mentor', async (req, res) => {
  const { prompt, config } = req.body;
  
  try {
    const model = ai.getGenerativeModel({ model: config.model || "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    
    // Devolvemos solo el texto para minimizar el tráfico
    res.json({ text: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: "Fallo en el servidor celestial" });
  }
});

app.listen(3000, () => console.log('Servidor Ignite en puerto 3000'));
*/
