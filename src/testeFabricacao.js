const base = "http://localhost:3001/api";

async function chamar(titulo, metodo, caminho, corpo) {
    const resposta = await fetch(base + caminho, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: corpo ? JSON.stringify(corpo) : undefined
    });
    const texto = await resposta.text();
    console.log("");
    console.log(titulo);
    console.log("   status: " + resposta.status);
    if (texto) console.log("   resposta: " + texto);
    return texto ? JSON.parse(texto) : null;
}

try {
    const produtos = await (await fetch(base + "/produtos")).json();
    const funcionarios = await (await fetch(base + "/funcionarios")).json();

    if (!Array.isArray(produtos) || produtos.length === 0 || funcionarios.length === 0) {
        console.log("Precisa de pelo menos 1 produto e 1 funcionario no banco.");
        console.log("Rode antes: node src/prepararBanco.js");
    } else {
        const dados = {
            produtoId: produtos[0].id,
            funcionarioId: funcionarios[0].id,
            data: "2026-11-25",
            quantidade: 50
        };

        const criada = await chamar("1. Criar ordem (esperado 201)", "POST", "/fabricacoes", dados);
        const id = criada.id;

        await chamar("2. Listar (esperado 200)", "GET", "/fabricacoes");
        await chamar("3. Buscar por id (esperado 200)", "GET", "/fabricacoes/" + id);
        await chamar("4. Editar quantidade (esperado 200)", "PUT", "/fabricacoes/" + id, { quantidade: 80 });
        await chamar("5. Iniciar producao (esperado 200)", "PATCH", "/fabricacoes/" + id + "/status", { status: "em_producao" });
        await chamar("6. Status invalido (esperado 400)", "PATCH", "/fabricacoes/" + id + "/status", { status: "xyz" });
        await chamar("7. Campos faltando (esperado 400)", "POST", "/fabricacoes", { quantidade: 10 });
        await chamar("8. Produto que nao existe (esperado 400)", "POST", "/fabricacoes", { ...dados, produtoId: 999999 });
        await chamar("9. Id que nao existe (esperado 404)", "GET", "/fabricacoes/999999");
        await chamar("10. Excluir (esperado 200)", "DELETE", "/fabricacoes/" + id);
        await chamar("11. Buscar a excluida (esperado 404)", "GET", "/fabricacoes/" + id);
    }
} catch (e) {
    console.error("Falhou. O servidor esta ligado? Detalhe:", e.message);
}
