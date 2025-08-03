import serviceAuth from "../services/service.auth.js";

async function Login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email e senha são obrigatórios" });
        }

        const result = await serviceAuth.Login(email, password);

        if (result.success) {
            res.status(200).json({
                success: true,
                token: result.token,
                user: result.user
            });
        } else {
            res.status(401).json({ error: "Email ou senha inválidos" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function RegisterPassenger(req, res) {
    try {
        const { name, email, phone, password, user_type } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios" });
        }

        const result = await serviceAuth.RegisterPassenger(name, email, phone, password, user_type);

        if (result.success) {
            res.status(201).json({
                success: true,
                message: "Usuário passageiro criado com sucesso"
            });
        } else {
            res.status(400).json({ error: result.error });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function RegisterDriver(req, res) {
    try {
        const { name, email, phone, password, car_model, car_plate, user_type } = req.body;

        if (!name || !email || !phone || !password || !car_model || !car_plate) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios" });
        }

        const result = await serviceAuth.RegisterDriver(name, email, phone, password, car_model, car_plate, user_type);

        if (result.success) {
            res.status(201).json({
                success: true,
                message: "Usuário motorista criado com sucesso"
            });
        } else {
            res.status(400).json({ error: result.error });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function Recovery(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email é obrigatório" });
        }

        const result = await serviceAuth.Recovery(email);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: "Email de recuperação enviado com sucesso"
            });
        } else {
            res.status(404).json({ error: "Email não encontrado" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export default { Login, RegisterPassenger, RegisterDriver, Recovery }; 