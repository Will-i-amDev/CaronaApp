import sqlite from "./sqlite.js";

async function checkDatabase() {
    try {
        console.log("=== VERIFICANDO ESTRUTURA DO BANCO ===");
        
        // Verificar estrutura da tabela users
        const usersSchema = await sqlite.all("PRAGMA table_info(users)");
        console.log("Estrutura da tabela users:");
        usersSchema.forEach(col => {
            console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
        });
        
        // Verificar estrutura da tabela rides
        const ridesSchema = await sqlite.all("PRAGMA table_info(rides)");
        console.log("\nEstrutura da tabela rides:");
        ridesSchema.forEach(col => {
            console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
        });
        
        // Verificar se há dados nas tabelas
        const userCount = await sqlite.get("SELECT COUNT(*) as count FROM users");
        console.log(`\nTotal de usuários: ${userCount.count}`);
        
        const rideCount = await sqlite.get("SELECT COUNT(*) as count FROM rides");
        console.log(`Total de corridas: ${rideCount.count}`);
        
        console.log("\n=== VERIFICAÇÃO CONCLUÍDA ===");
        
    } catch (error) {
        console.error("Erro ao verificar banco:", error);
    }
}

checkDatabase(); 