-- =============================================================================
-- ESQUEMA v2 DO BANCO DE DADOS - SISTEMA DE PADARIA (Padaria-Web)
-- PostgreSQL · revisado em 2026-11-16 (tipos, FKs, CHECKs, índices, unificação clientes→usuarios)
--
-- Aplicar em banco NOVO (psql -d padaria -f database/schema.sql) ou via
-- `npm run db:reset` (derruba e recria o schema a partir dos models + seed).
-- NÃO aplicar sobre banco com dados reais sem backup.
-- =============================================================================

-- 1. Categorias de Produtos e Receitas
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    emoji VARCHAR(10) DEFAULT '🥖',
    cor VARCHAR(20) DEFAULT '#c48d4a',
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. Insumos / Matérias-primas
CREATE TABLE IF NOT EXISTS insumos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL UNIQUE,
    unidade_medida VARCHAR(20) NOT NULL,
    quantidade_atual DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (quantidade_atual >= 0),
    estoque_minimo DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),
    custo DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (custo >= 0),
    fornecedor VARCHAR(150)
);

-- 3. Funcionários / Colaboradores (RH — não são contas de acesso)
CREATE TABLE IF NOT EXISTS funcionarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    telefone VARCHAR(20),
    cpf VARCHAR(20),
    data_admissao DATE,
    salario DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (salario >= 0),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4. Usuários do Sistema (Autenticação / Acesso) — única tabela de identidade.
--    `tipo`: 'cliente' (portal) | 'funcionario' (painel administrativo).
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cpf VARCHAR(20),
    tipo VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (tipo IN ('cliente', 'funcionario')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Receitas (Fichas Técnicas)
CREATE TABLE IF NOT EXISTS receitas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    rendimento DOUBLE PRECISION NOT NULL DEFAULT 1 CHECK (rendimento > 0),
    unidade_rendimento VARCHAR(30) NOT NULL DEFAULT 'unidades',
    tempo_preparo INTEGER NOT NULL DEFAULT 0 CHECK (tempo_preparo >= 0),
    instrucoes TEXT
);

-- 6. Ingredientes da Receita (Ficha técnica detalhada N:N)
CREATE TABLE IF NOT EXISTS receita_ingredientes (
    id SERIAL PRIMARY KEY,
    receita_id INTEGER NOT NULL REFERENCES receitas(id) ON DELETE CASCADE,
    insumo_id INTEGER NOT NULL REFERENCES insumos(id) ON DELETE RESTRICT,
    quantidade DOUBLE PRECISION NOT NULL CHECK (quantidade > 0),
    UNIQUE (receita_id, insumo_id)
);

-- 7. Produtos
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    receita_id INTEGER REFERENCES receitas(id) ON DELETE SET NULL,
    preco DECIMAL(10, 2) NOT NULL CHECK (preco >= 0),
    estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    descricao TEXT,
    emoji VARCHAR(10) DEFAULT '🥖'
);

-- 8. Ordens de Fabricação / Produção
CREATE TABLE IF NOT EXISTS fabricacoes (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
    funcionario_id INTEGER REFERENCES funcionarios(id) ON DELETE SET NULL,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    quantidade DOUBLE PRECISION NOT NULL DEFAULT 1 CHECK (quantidade > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'planejado'
        CHECK (status IN ('planejado', 'em_producao', 'concluido', 'cancelado'))
);

-- 9. Pedidos de Venda
--    cliente_id referencia usuarios(id) (identidade unificada). cliente_nome/cliente_email
--    são SNAPSHOT de conveniência para exibir o pedido mesmo se o usuário for excluído.
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    cliente_nome VARCHAR(150),
    cliente_email VARCHAR(150),
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'pendente'
        CHECK (status IN ('pendente', 'preparando', 'pronto', 'entregue', 'cancelado')),
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    observacao TEXT
);

-- 10. Itens do Pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
    quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
    preco_unit DECIMAL(10, 2) NOT NULL CHECK (preco_unit >= 0),
    UNIQUE (pedido_id, produto_id)
);

-- Índices (FKs e colunas de filtro frequente)
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_receita ON produtos(receita_id);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);
CREATE INDEX IF NOT EXISTS idx_receitas_categoria ON receitas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_receita_ingredientes_receita ON receita_ingredientes(receita_id);
CREATE INDEX IF NOT EXISTS idx_receita_ingredientes_insumo ON receita_ingredientes(insumo_id);
CREATE INDEX IF NOT EXISTS idx_fabricacoes_produto ON fabricacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_fabricacoes_funcionario ON fabricacoes(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_fabricacoes_status ON fabricacoes(status);
CREATE INDEX IF NOT EXISTS idx_fabricacoes_data ON fabricacoes(data);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos(data);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON pedido_itens(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_produto ON pedido_itens(produto_id);
-- usuarios.email já é UNIQUE (constraint cria índice) — sem índice redundante.

-- =============================================================================
-- DADOS INICIAIS (SEED) — idempotente
-- =============================================================================

INSERT INTO categorias (id, nome, descricao, emoji, cor, ativo) VALUES
(1, 'Pães', 'Pães artesanais e industriais', '🥖', '#c48d4a', TRUE),
(2, 'Bolos', 'Bolos inteiros e fatias', '🍰', '#e8a020', TRUE),
(3, 'Folhados', 'Croissants e massas folhadas', '🥐', '#d9b07a', TRUE),
(4, 'Salgados', 'Salgadinhos e esfihas', '🧀', '#8a5420', TRUE),
(5, 'Bebidas', 'Cafés, sucos e vitaminas', '☕', '#6b3d16', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO insumos (id, nome, unidade_medida, quantidade_atual, estoque_minimo, custo, fornecedor) VALUES
(1, 'Farinha de trigo', 'kg', 50, 10, 4.50, 'Moinho São Paulo'),
(2, 'Açúcar refinado', 'kg', 20, 5, 3.20, 'Usina Central'),
(3, 'Manteiga', 'kg', 8, 3, 32.00, 'Laticínios Silva'),
(4, 'Ovos', 'dúzia', 15, 5, 12.00, 'Granja Boa Vista'),
(5, 'Fermento biológico', 'kg', 2, 1, 18.00, 'Fleischmann'),
(6, 'Sal', 'kg', 5, 1, 1.50, 'Distribuidora Norte'),
(7, 'Leite integral', 'L', 3, 5, 5.50, 'Laticínios Silva'),
(8, 'Chocolate em pó', 'kg', 4, 2, 22.00, 'Cacau Show')
ON CONFLICT (id) DO NOTHING;

INSERT INTO funcionarios (id, nome, cargo, email, telefone, cpf, data_admissao, salario, ativo) VALUES
(1, 'João Silva', 'Padeiro', 'joao@padaria.com', '(11) 99999-0001', '123.456.789-00', '2020-03-15', 2800.00, TRUE),
(2, 'Maria Souza', 'Confeiteira', 'maria@padaria.com', '(11) 99999-0002', '234.567.890-11', '2019-07-01', 3200.00, TRUE),
(3, 'Carlos Ferreira', 'Atendente', 'carlos@padaria.com', '(11) 99999-0003', '345.678.901-22', '2022-01-10', 1900.00, TRUE),
(4, 'Ana Lima', 'Caixa', 'ana.lima@padaria.com', '(11) 99999-0004', '456.789.012-33', '2021-06-20', 2100.00, FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO receitas (id, nome, categoria_id, rendimento, unidade_rendimento, tempo_preparo, instrucoes) VALUES
(1, 'Pão Francês', 1, 30, 'unidades', 180, 'Misturar ingredientes, sovar 15min, descansar 1h, modelar e assar a 220°C por 20min.'),
(2, 'Bolo de Chocolate', 2, 12, 'fatias', 90, 'Bater manteiga e açúcar, adicionar ovos, alternar farinha e chocolate. Assar a 180°C por 40min.'),
(3, 'Croissant', 3, 12, 'unidades', 360, 'Preparar massa, laminar com manteiga em 3 dobras. Refrigerar 30min entre dobras. Assar a 200°C por 18min.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO receita_ingredientes (receita_id, insumo_id, quantidade) VALUES
(1, 1, 1.0), (1, 5, 0.01), (1, 6, 0.02),
(2, 1, 0.3), (2, 2, 0.4), (2, 3, 0.15), (2, 4, 0.25), (2, 8, 0.1),
(3, 1, 0.5), (3, 3, 0.25), (3, 2, 0.05), (3, 6, 0.01), (3, 5, 0.008)
ON CONFLICT (receita_id, insumo_id) DO NOTHING;

INSERT INTO produtos (id, nome, categoria_id, receita_id, preco, estoque, ativo, descricao, emoji) VALUES
(1, 'Pão Francês', 1, 1, 0.90, 150, TRUE, 'Crocante por fora, macio por dentro.', '🥖'),
(2, 'Bolo de Chocolate', 2, 2, 12.00, 24, TRUE, 'Fatia generosa do nosso bolo úmido.', '🍫'),
(3, 'Croissant', 3, 3, 8.50, 36, TRUE, 'Folhado artesanal com manteiga francesa.', '🥐'),
(4, 'Pão de Queijo (6un)', 4, NULL, 18.00, 50, TRUE, 'Pão de queijo mineiro tradicional.', '🧀'),
(5, 'Café com Leite', 5, NULL, 7.00, 100, TRUE, 'Café coado artesanal com leite vaporizado.', '☕')
ON CONFLICT (id) DO NOTHING;

SELECT setval('categorias_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categorias));
SELECT setval('insumos_id_seq', (SELECT COALESCE(MAX(id), 1) FROM insumos));
SELECT setval('funcionarios_id_seq', (SELECT COALESCE(MAX(id), 1) FROM funcionarios));
SELECT setval('receitas_id_seq', (SELECT COALESCE(MAX(id), 1) FROM receitas));
SELECT setval('produtos_id_seq', (SELECT COALESCE(MAX(id), 1) FROM produtos));
