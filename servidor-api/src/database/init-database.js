import sqlite from "./sqlite.js";
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDatabase() {
    try {
        console.log("Inicializando banco de dados...");
        
        // Ler o script SQL
        const scriptPath = join(__dirname, 'script-database.sql');
        const script = fs.readFileSync(scriptPath, 'utf8');
        
        // Executar os comandos SQL
        const commands = script.split(';').filter(cmd => cmd.trim());
        
        for (const command of commands) {
            if (command.trim()) {
                await sqlite.run(command.trim());
                console.log("Comando executado:", command.trim().substring(0, 50) + "...");
            }
        }
        
        console.log("Banco de dados inicializado com sucesso!");
        
    } catch (error) {
        console.error("Erro ao inicializar banco de dados:", error);
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    initDatabase();
}

export default initDatabase; 