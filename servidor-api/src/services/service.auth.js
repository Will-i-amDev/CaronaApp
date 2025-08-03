import repositoryAuth from "../repositories/repository.auth.js";
import crypto from "crypto";

async function Login(email, password) {
    try {
        const user = await repositoryAuth.GetUserByEmail(email);

        if (!user) {
            return { success: false, error: "Usuário não encontrado" };
        }

        // Em produção, usar bcrypt para comparar senhas
        const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
        
        if (user.password !== hashedPassword) {
            return { success: false, error: "Senha incorreta" };
        }

        // Em produção, usar JWT para gerar token
        const token = crypto.randomBytes(32).toString('hex');

        return {
            success: true,
            token: token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                user_type: user.user_type
            }
        };

    } catch (error) {
        throw new Error("Erro ao fazer login: " + error.message);
    }
}

async function RegisterPassenger(name, email, phone, password, user_type) {
    try {
        const existingUser = await repositoryAuth.GetUserByEmail(email);

        if (existingUser) {
            return { success: false, error: "Email já cadastrado" };
        }

        // Em produção, usar bcrypt para hash da senha
        const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

        const result = await repositoryAuth.CreateUser(name, email, phone, hashedPassword, user_type);

        // SQLite retorna um objeto com informações da operação
        if (result && (result.lastID || result.changes > 0)) {
            return { success: true, message: "Usuário passageiro criado com sucesso" };
        } else {
            return { success: false, error: "Erro ao criar usuário" };
        }

    } catch (error) {
        console.error("Erro no service RegisterPassenger:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}

async function RegisterDriver(name, email, phone, password, car_model, car_plate, user_type) {
    try {
        const existingUser = await repositoryAuth.GetUserByEmail(email);

        if (existingUser) {
            return { success: false, error: "Email já cadastrado" };
        }

        // Em produção, usar bcrypt para hash da senha
        const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

        const result = await repositoryAuth.CreateDriver(name, email, phone, hashedPassword, car_model, car_plate, user_type);

        // SQLite retorna um objeto com informações da operação
        if (result && (result.lastID || result.changes > 0)) {
            return { success: true, message: "Usuário motorista criado com sucesso" };
        } else {
            return { success: false, error: "Erro ao criar usuário" };
        }

    } catch (error) {
        console.error("Erro no service RegisterDriver:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}

async function Recovery(email) {
    try {
        const user = await repositoryAuth.GetUserByEmail(email);

        if (!user) {
            return { success: false, error: "Email não encontrado" };
        }

        // Em produção, implementar envio de email com link de recuperação
        // Por enquanto, apenas retornamos sucesso se o email existe
        console.log(`Email de recuperação seria enviado para: ${email}`);
        
        return { success: true, message: "Email de recuperação enviado" };

    } catch (error) {
        throw new Error("Erro ao processar recuperação: " + error.message);
    }
}

export default { Login, RegisterPassenger, RegisterDriver, Recovery }; 