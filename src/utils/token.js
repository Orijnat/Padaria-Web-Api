// Autenticação por token JWT (HS256) nativo do Node.js sem dependência extra.
import { createHmac, timingSafeEqual } from "node:crypto";

const DURACAO_SEGUNDOS = 7 * 24 * 60 * 60; // 7 dias

function segredo() {
  const valor = process.env.JWT_SECRET;
  if (valor) return valor;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Defina a variável de ambiente JWT_SECRET.");
  }
  return "segredo-de-desenvolvimento-padaria-api";
}

const base64url = (objeto) =>
  Buffer.from(JSON.stringify(objeto)).toString("base64url");

function assinar(conteudo) {
  return createHmac("sha256", segredo()).update(conteudo).digest("base64url");
}

export function gerarToken(usuario) {
  const agora = Math.floor(Date.now() / 1000);
  const conteudo = `${base64url({ alg: "HS256", typ: "JWT" })}.${base64url({
    sub: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo,
    iat: agora,
    exp: agora + DURACAO_SEGUNDOS,
  })}`;
  return `${conteudo}.${assinar(conteudo)}`;
}

export function verificarToken(token) {
  if (typeof token !== "string") return null;
  const partes = token.split(".");
  if (partes.length !== 3) return null;
  const [cabecalho, corpo, assinatura] = partes;

  const esperada = Buffer.from(assinar(`${cabecalho}.${corpo}`));
  const recebida = Buffer.from(assinatura);
  if (esperada.length !== recebida.length) return null;
  if (!timingSafeEqual(esperada, recebida)) return null;

  try {
    const { alg } = JSON.parse(Buffer.from(cabecalho, "base64url").toString());
    const dados = JSON.parse(Buffer.from(corpo, "base64url").toString());
    if (alg !== "HS256" || !dados?.sub) return null;
    if (Math.floor(Date.now() / 1000) >= dados.exp) return null;
    return dados;
  } catch {
    return null;
  }
}
