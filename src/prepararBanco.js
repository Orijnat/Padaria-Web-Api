import { sequelize } from "./config/index.js";
import { Produto, Funcionario, OrdemFabricacao } from "./models/index.js";

// Script local: deixa o SEU banco pronto para a ordem de fabricação.
// Não precisa ir para o git.
const produtosExemplo = [
    { id: 1, nome: "Pão Francês", preco: 0.9, estoque: 0, descricao: "Crocante por fora, macio por dentro.", emoji: "🥖", ativo: true },
    { id: 2, nome: "Bolo de Chocolate", preco: 12, estoque: 0, descricao: "Fatia generosa do nosso bolo úmido.", emoji: "🍫", ativo: true },
    { id: 3, nome: "Croissant", preco: 8.5, estoque: 0, descricao: "Folhado artesanal com manteiga francesa.", emoji: "🥐", ativo: true },
    { id: 4, nome: "Pão de Queijo (6un)", preco: 18, estoque: 0, descricao: "Pão de queijo mineiro tradicional.", emoji: "🧀", ativo: true },
    { id: 5, nome: "Café com Leite", preco: 7, estoque: 0, descricao: "Café coado artesanal com leite vaporizado.", emoji: "☕", ativo: true }
];

try {
    // alter: true só ACRESCENTA as colunas que faltam na tabela produtos
    await Produto.sync({ alter: true });
    await Funcionario.sync();

    for (const produto of produtosExemplo) {
        await Produto.upsert(produto);
    }
    // Acerta o contador de ids para os próximos cadastros não repetirem o número
    await sequelize.query(
        "SELECT setval(pg_get_serial_sequence('produtos', 'id'), (SELECT MAX(id) FROM produtos))"
    );

    await OrdemFabricacao.sync();
    console.log("Banco pronto: produtos de exemplo e tabela ordens_fabricacao criados.");
} catch (e) {
    console.error("Falhou:", e.message);
} finally {
    await sequelize.close();
}
