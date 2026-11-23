import {
    Categoria,
    Insumo,
    Produto,
    Receita,
    ReceitaIngrediente,
    Funcionario,
    Usuario
} from "../models/index.js";
import { gerarHashSenha } from "../utils/senha.js";

export async function seedDatabase() {
    const countCategorias = await Categoria.count();
    if (countCategorias === 0) {
        console.log("🌱 Inserindo categorias iniciais...");
        await Categoria.bulkCreate([
            { id: 1, nome: 'Pães', descricao: 'Pães artesanais e industriais', emoji: '🥖', cor: '#c48d4a', ativo: true },
            { id: 2, nome: 'Bolos', descricao: 'Bolos inteiros e fatias', emoji: '🍰', cor: '#e8a020', ativo: true },
            { id: 3, nome: 'Folhados', descricao: 'Croissants e massas folhadas', emoji: '🥐', cor: '#d9b07a', ativo: true },
            { id: 4, nome: 'Salgados', descricao: 'Salgadinhos e esfihas', emoji: '🧀', cor: '#8a5420', ativo: true },
            { id: 5, nome: 'Bebidas', descricao: 'Cafés, sucos e vitaminas', emoji: '☕', cor: '#6b3d16', ativo: true },
        ]);
    }

    const countInsumos = await Insumo.count();
    if (countInsumos === 0) {
        console.log("🌱 Inserindo insumos iniciais...");
        await Insumo.bulkCreate([
            { id: 1, nome: 'Farinha de trigo', unidadeMedida: 'kg', quantidadeAtual: 50, estoqueMinimo: 10, custo: 4.50, fornecedor: 'Moinho São Paulo' },
            { id: 2, nome: 'Açúcar refinado', unidadeMedida: 'kg', quantidadeAtual: 20, estoqueMinimo: 5, custo: 3.20, fornecedor: 'Usina Central' },
            { id: 3, nome: 'Manteiga', unidadeMedida: 'kg', quantidadeAtual: 8, estoqueMinimo: 3, custo: 32.00, fornecedor: 'Laticínios Silva' },
            { id: 4, nome: 'Ovos', unidadeMedida: 'dúzia', quantidadeAtual: 15, estoqueMinimo: 5, custo: 12.00, fornecedor: 'Granja Boa Vista' },
            { id: 5, nome: 'Fermento biológico', unidadeMedida: 'kg', quantidadeAtual: 2, estoqueMinimo: 1, custo: 18.00, fornecedor: 'Fleischmann' },
            { id: 6, nome: 'Sal', unidadeMedida: 'kg', quantidadeAtual: 5, estoqueMinimo: 1, custo: 1.50, fornecedor: 'Distribuidora Norte' },
            { id: 7, nome: 'Leite integral', unidadeMedida: 'L', quantidadeAtual: 3, estoqueMinimo: 5, custo: 5.50, fornecedor: 'Laticínios Silva' },
            { id: 8, nome: 'Chocolate em pó', unidadeMedida: 'kg', quantidadeAtual: 4, estoqueMinimo: 2, custo: 22.00, fornecedor: 'Cacau Show' },
        ]);
    }

    const countFuncionarios = await Funcionario.count();
    if (countFuncionarios === 0) {
        console.log("🌱 Inserindo funcionários iniciais...");
        await Funcionario.bulkCreate([
            { id: 1, nome: 'João Silva', cargo: 'Padeiro', email: 'joao@padaria.com', telefone: '(11) 99999-0001', cpf: '123.456.789-00', dataAdmissao: '2020-03-15', salario: 2800.00, ativo: true },
            { id: 2, nome: 'Maria Souza', cargo: 'Confeiteira', email: 'maria@padaria.com', telefone: '(11) 99999-0002', cpf: '234.567.890-11', dataAdmissao: '2019-07-01', salario: 3200.00, ativo: true },
            { id: 3, nome: 'Carlos Ferreira', cargo: 'Atendente', email: 'carlos@padaria.com', telefone: '(11) 99999-0003', cpf: '345.678.901-22', dataAdmissao: '2022-01-10', salario: 1900.00, ativo: true },
            { id: 4, nome: 'Ana Lima', cargo: 'Caixa', email: 'ana.lima@padaria.com', telefone: '(11) 99999-0004', cpf: '456.789.012-33', dataAdmissao: '2021-06-20', salario: 2100.00, ativo: false },
        ]);
    }

    const countReceitas = await Receita.count();
    if (countReceitas === 0) {
        console.log("🌱 Inserindo receitas iniciais...");
        await Receita.bulkCreate([
            { id: 1, nome: 'Pão Francês', categoriaId: 1, rendimento: 30, unidadeRendimento: 'unidades', tempoPreparo: 180, instrucoes: 'Misturar ingredientes, sovar 15min, descansar 1h, modelar e assar a 220°C por 20min.' },
            { id: 2, nome: 'Bolo de Chocolate', categoriaId: 2, rendimento: 12, unidadeRendimento: 'fatias', tempoPreparo: 90, instrucoes: 'Bater manteiga e açúcar, adicionar ovos, alternar farinha e chocolate. Assar a 180°C por 40min.' },
            { id: 3, nome: 'Croissant', categoriaId: 3, rendimento: 12, unidadeRendimento: 'unidades', tempoPreparo: 360, instrucoes: 'Preparar massa, laminar com manteiga em 3 dobras. Refrigerar 30min entre dobras. Assar a 200°C por 18min.' },
        ]);

        await ReceitaIngrediente.bulkCreate([
            { receitaId: 1, insumoId: 1, quantidade: 1.0 },
            { receitaId: 1, insumoId: 5, quantidade: 0.01 },
            { receitaId: 1, insumoId: 6, quantidade: 0.02 },
            { receitaId: 2, insumoId: 1, quantidade: 0.3 },
            { receitaId: 2, insumoId: 2, quantidade: 0.4 },
            { receitaId: 2, insumoId: 3, quantidade: 0.15 },
            { receitaId: 2, insumoId: 4, quantidade: 0.25 },
            { receitaId: 2, insumoId: 8, quantidade: 0.1 },
            { receitaId: 3, insumoId: 1, quantidade: 0.5 },
            { receitaId: 3, insumoId: 3, quantidade: 0.25 },
            { receitaId: 3, insumoId: 2, quantidade: 0.05 },
            { receitaId: 3, insumoId: 6, quantidade: 0.01 },
            { receitaId: 3, insumoId: 5, quantidade: 0.008 },
        ]);
    }

    const countProdutos = await Produto.count();
    if (countProdutos === 0) {
        console.log("🌱 Inserindo produtos iniciais...");
        await Produto.bulkCreate([
            { id: 1, nome: 'Pão Francês', categoriaId: 1, receitaId: 1, preco: 0.90, estoque: 150, ativo: true, descricao: 'Crocante por fora, macio por dentro.', emoji: '🥖' },
            { id: 2, nome: 'Bolo de Chocolate', categoriaId: 2, receitaId: 2, preco: 12.00, estoque: 24, ativo: true, descricao: 'Fatia generosa do nosso bolo úmido.', emoji: '🍫' },
            { id: 3, nome: 'Croissant', categoriaId: 3, receitaId: 3, preco: 8.50, estoque: 36, ativo: true, descricao: 'Folhado artesanal com manteiga francesa.', emoji: '🥐' },
            { id: 4, nome: 'Pão de Queijo (6un)', categoriaId: 4, receitaId: null, preco: 18.00, estoque: 50, ativo: true, descricao: 'Pão de queijo mineiro tradicional.', emoji: '🧀' },
            { id: 5, nome: 'Café com Leite', categoriaId: 5, receitaId: null, preco: 7.00, estoque: 100, ativo: true, descricao: 'Café coado artesanal com leite vaporizado.', emoji: '☕' },
        ]);
    }

    const countAdmin = await Usuario.count({ where: { tipo: 'funcionario' } });
    if (countAdmin === 0) {
        const email = (process.env.ADMIN_EMAIL || "admin@padaria.com").toLowerCase();
        const senha = process.env.ADMIN_SENHA;
        if (process.env.NODE_ENV === 'production' && !senha) {
            console.error("🚫 Seed abortado: defina ADMIN_SENHA no ambiente de produção.");
            process.exit(1);
        }
        console.log("🌱 Criando usuário administrador inicial...");
        await Usuario.create({
            nome: "Administrador",
            email,
            tipo: "funcionario",
            senhaHash: await gerarHashSenha(senha || "admin1234")
        });
        console.log(`👤 Administrador criado: ${email}`);
    }
}
