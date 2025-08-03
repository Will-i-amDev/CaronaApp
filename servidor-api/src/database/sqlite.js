import sqlite3 from "sqlite3";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SQLite = sqlite3.verbose();
const dbPath = join(__dirname, 'banco_appcarona.db');

const db = new SQLite.Database(dbPath, SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE, (err) => {
    if (err) {
        console.log("Database error: " + err.message);
    } else {
        console.log("Database connected successfully");
    }
});

function execute(command, params, method = "all") {
    return new Promise((resolve, reject) => {
        console.log("Executando query:", command.substring(0, 50) + "...");
        console.log("Parâmetros:", params);
        
        const timeout = setTimeout(() => {
            reject(new Error("Timeout na execução da query"));
        }, 10000); // 10 segundos de timeout
        
        db[method](command, params, (error, result) => {
            clearTimeout(timeout);
            if (error) {
                console.error("Erro na query:", error);
                reject(error);
            } else {
                console.log("Query executada com sucesso");
                resolve(result);
            }
        });
    });
}

// Métodos específicos para facilitar o uso
const sqlite = {
    get: (query, params = []) => execute(query, params, "get"),
    all: (query, params = []) => execute(query, params, "all"),
    run: (query, params = []) => execute(query, params, "run")
};

export default sqlite;