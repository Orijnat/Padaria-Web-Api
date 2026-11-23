import sequelize from "../config/database.js";
import { seedDatabase } from "./seed.js";

const host = (process.env.DB_HOST || "localhost").toLowerCase();
const syncPermitido = ["localhost", "127.0.0.1", "::1"].includes(host) || process.env.ALLOW_DB_SYNC === "yes";

if (!syncPermitido) {
    console.error(`🚫 db:sync recusado: DB_HOST aponta para um host remoto ('${host}').`);
    console.error("   sync({ alter: true }) pode alterar/dropar colunas. Em desenvolvimento local, nada a fazer.");
    console.error("   Para permitir explicitamente, rode com ALLOW_DB_SYNC=yes (após backup).");
    process.exit(1);
}

async function syncAndSeed() {
    try {
        console.log("🔄 Conectando ao PostgreSQL...");
        await sequelize.authenticate();
        console.log("✅ Conexão estabelecida com sucesso.");

        console.log("📦 Sincronizando tabelas com o banco de dados...");
        await sequelize.sync({ alter: true });
        console.log("✅ Tabelas sincronizadas com sucesso:");
        console.log("   - categorias, insumos, funcionarios, receitas, receita_ingredientes");
        console.log("   - produtos, fabricacoes, usuarios, pedidos, pedido_itens");

        await seedDatabase();

        console.log("🎉 Banco de dados inicializado com sucesso!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Erro ao sincronizar o banco de dados:", error.message);
        process.exit(1);
    }
}

syncAndSeed();
