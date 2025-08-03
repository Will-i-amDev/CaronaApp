import sqlite from "../database/sqlite.js";

async function GetUserByEmail(email) {
    try {
        const query = "SELECT * FROM users WHERE email = ?";
        const result = await sqlite.get(query, [email]);
        return result;
    } catch (error) {
        throw new Error("Erro ao buscar usuário por email: " + error.message);
    }
}

async function CreateUser(name, email, phone, password, user_type) {
    try {
        console.log("Tentando criar usuário:", { name, email, phone, user_type });
        const query = "INSERT INTO users (name, email, phone, password, user_type) VALUES (?, ?, ?, ?, ?)";
        const result = await sqlite.run(query, [name, email, phone, password, user_type]);
        console.log("Usuário criado com sucesso:", result);
        
        // Verificar se a operação foi bem-sucedida
        if (result && result.lastID) {
            return result;
        } else {
            throw new Error("Falha ao inserir usuário no banco de dados");
        }
    } catch (error) {
        console.error("Erro detalhado ao criar usuário:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}

async function CreateDriver(name, email, phone, password, car_model, car_plate, user_type) {
    try {
        console.log("Tentando criar motorista:", { name, email, phone, car_model, car_plate, user_type });
        const query = "INSERT INTO users (name, email, phone, password, user_type, car_model, car_plate) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const result = await sqlite.run(query, [name, email, phone, password, user_type, car_model, car_plate]);
        console.log("Motorista criado com sucesso:", result);
        
        // Verificar se a operação foi bem-sucedida
        if (result && result.lastID) {
            return result;
        } else {
            throw new Error("Falha ao inserir motorista no banco de dados");
        }
    } catch (error) {
        console.error("Erro detalhado ao criar motorista:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}

export default { GetUserByEmail, CreateUser, CreateDriver }; 