import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sequelize from "../config/database.js";
import "../models/index.js";
import { seedDatabase } from "./seed.js";

const host = (process.env.DB_HOST || "localhost").toLowerCase();
const resetPermitido = ["localhost", "127.0.0.1", "::1"].includes(host) || process.env.ALLOW_DB_RESET === "yes";

if (!resetPermitido) {
    console.error("🚫 db:reset recusado: DB_HOST aponta para um host remoto ('" + host + "').");
    console.error("   Este comando APAGA TODAS AS TABELAS e recria o schema do zero (uso em desenvolvimento).");
    console.error("   Para permitir explicitamente, rode com ALLOW_DB_RESET=yes.");
    process.exit(1);
}

const TABELAS = [
    'pedido_itens',
    'pedidos',
    'fabricacoes',
    'receita_ingredientes',
    'produtos',
    'receitas',
    'insumos',
    'funcionarios',
    'usuarios',
    'clientes',
    'categorias'
];

async function reset() {
    console.log("🔄 Conectando ao PostgreSQL...");
    await sequelize.authenticate();
    console.log("✅ Conexão estabelecida.");

    console.log("🗑️  Removendo tabelas existentes (DROP ... CASCADE)...");
    for (const tabela of TABELAS) {
        await sequelize.query(`DROP TABLE IF EXISTS ${tabela} CASCADE`);
    }

    console.log("📦 Aplicando database/schema.sql...");
    const schemaPath = join(dirname(fileURLToPath(import.meta.url)), "../../database/schema.sql");
    const schemaSql = readFileSync(schemaPath, "utf8");
    await sequelize.query(schemaSql);

    console.log("🌱 Populando dados iniciais (idempotente)...");
    await seedDatabase();

    console.log("🎉 Banco recriado com sucesso.");
    process.exit(0);
}

reset().catch((error) => {
    console.error("❌ Erro ao recriar o banco de dados:", error);
    process.exit(1);
});
