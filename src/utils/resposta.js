const isProduction = () => process.env.NODE_ENV === "production";

export const sucesso = (res, data = null, message = undefined, status = 200) => {
    const body = { success: true };
    if (data !== null && data !== undefined) body.data = data;
    if (message) body.message = message;
    return res.status(status).json(body);
};

export const criado = (res, data = null, message = undefined) =>
    sucesso(res, data, message, 201);

export const erro = (res, status = 500, message = "Erro interno.", detalhes = undefined) => {
    const body = { success: false, message };
    if (detalhes !== undefined && !isProduction()) body.error = detalhes;
    return res.status(status).json(body);
};

export const erroDeValidacao = (res, campos, message = "Dados inválidos.") =>
    res.status(400).json({ success: false, message, campos });

export const conflito = (res, message, campos = undefined) =>
    res.status(409).json({ success: false, message, ...(campos ? { campos } : {}) });

export const erroDoSequelize = (res, error, message = "Erro ao processar a operação.") => {
    if (error?.name === "SequelizeValidationError" || error?.name === "SequelizeUniqueConstraintError") {
        const campos = error.errors?.reduce((acc, err) => {
            if (err.path) acc[err.path] = err.message;
            return acc;
        }, {});
        return erroDeValidacao(res, campos && Object.keys(campos).length ? campos : (error.errors?.map(e => e.message) || error.message), message);
    }
    if (error?.name === "SequelizeForeignKeyConstraintError") {
        return erro(res, 400, "Referência inválida: verifique os registros relacionados.", error.message);
    }
    return erro(res, 500, message, error?.message);
};
