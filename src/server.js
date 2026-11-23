import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database.js";
import routes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";

const origensPermitidas = (process.env.CORS_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean);
const corsOptions = origensPermitidas.length > 0
  ? { origin: origensPermitidas }
  : {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (!isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Origem não permitida pelo CORS."));
      },
    };

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    service: "Padaria-API",
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// Rotas da API
app.use("/api", routes);

// 404 — envelope canônico
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Rota não encontrada." });
});

// Erros (JSON malformado, CORS, falhas não tratadas) — envelope, sem stack em produção
app.use((err, req, res, _next) => {
  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({ success: false, message: "JSON inválido no corpo da requisição." });
  }
  if (err?.message === "Origem não permitida pelo CORS.") {
    return res.status(403).json({ success: false, message: err.message });
  }
  console.error("Erro não tratado:", err);
  res.status(500).json({
    success: false,
    message: "Erro interno do servidor.",
    ...(isProduction ? {} : { error: err?.message }),
  });
});

// Inicialização do servidor e conexão com o banco de dados
async function startServer() {
  try {
    console.log("Conectando ao banco de dados...");
    await sequelize.authenticate();
    console.log("✅ Conexão com o PostgreSQL autenticada com sucesso.");

    // Sincroniza os modelos com o banco de dados
    await sequelize.sync();
    console.log("✅ Modelos sincronizados com o banco de dados.");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.warn("⚠️ Aviso de conexão com o banco de dados:", error.message);
    if (isProduction) {
      console.error("Encerrando: em produção a API não sobe sem banco de dados.");
      process.exit(1);
    }
    console.log("Iniciando servidor HTTP em modo de desenvolvimento...");
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  }
}

startServer();
