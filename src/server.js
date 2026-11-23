import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database.js";
import routes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Padaria-API",
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// Rotas da API
app.use("/api", routes);

// Inicialização do servidor e conexão com o banco de dados
async function startServer() {
  try {
    console.log("Conectando ao banco de dados...");
    await sequelize.authenticate();
    console.log("✅ Conexão com o PostgreSQL autenticada com sucesso.");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.warn("⚠️ Aviso de conexão com o banco de dados:", error.message);
    console.log("Iniciando servidor HTTP em modo de desenvolvimento...");
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  }
}

startServer();
