import sqlite from "../database/sqlite.js";

async function List(passenger_user_id, pickup_date, ride_id,
    driver_user_id, status, status_not) {
    try {
        let filtro = [];

        let sql = `select r.*, u.name as passenger_name, u.phone as passenger_phone,
                    d.name as driver_name, d.phone as driver_phone
        from rides r
        join users u on (u.user_id = r.passenger_user_id)
        left join users d on (d.user_id = r.driver_user_id)
        where r.ride_id > 0 `

        if (passenger_user_id) {
            sql = sql + " and r.passenger_user_id = ? ";
            filtro.push(passenger_user_id);
        }

        if (pickup_date) {
            sql = sql + " and r.pickup_date = ? ";
            filtro.push(pickup_date);
        }

        if (ride_id) {
            sql = sql + " and r.ride_id = ? ";
            filtro.push(ride_id);
        }

        if (driver_user_id) {
            sql = sql + " and r.driver_user_id = ? ";
            filtro.push(driver_user_id);
        }

        if (status) {
            sql = sql + " and r.status = ? ";
            filtro.push(status);
        }

        if (status_not) {
            sql = sql + " and r.status <> ? ";
            filtro.push(status_not);
        }

        console.log("SQL Query:", sql);
        console.log("Parâmetros:", filtro);
        
        const rides = await sqlite.all(sql, filtro);
        console.log("Corridas retornadas:", rides);
        return rides;
    } catch (error) {
        console.error("Erro detalhado ao listar corridas:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}

async function Insert(passenger_user_id, pickup_address,
    pickup_latitude, pickup_longitude, dropoff_address) {
    try {
        console.log("Tentando inserir corrida no repository:", { passenger_user_id, pickup_address, dropoff_address });
        
        let dt = new Date().toISOString("pt-BR", { timeZone: "America/Sao_Paulo" }).substring(0, 10);

        let sql = `insert into rides(passenger_user_id, pickup_address,
            pickup_latitude, pickup_longitude, dropoff_address, pickup_date, status)
            values(?, ?, ?, ?, ?, ?, 'P') returning ride_id`;

        const ride = await sqlite.run(sql, [passenger_user_id, pickup_address,
            pickup_latitude, pickup_longitude, dropoff_address, dt]);

        console.log("Corrida inserida no repository com sucesso:", ride);
        return ride;
    } catch (error) {
        console.error("Erro detalhado ao inserir corrida:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}

async function Delete(ride_id) {
    try {
        console.log("Tentando deletar corrida no repository:", ride_id);
        
        let sql = `delete from rides where ride_id = ?`;

        await sqlite.run(sql, [ride_id]);

        console.log("Corrida deletada no repository com sucesso:", ride_id);
        return { ride_id }
    } catch (error) {
        console.error("Erro detalhado ao deletar corrida:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}

async function Finish(ride_id, passenger_user_id) {
    try {
        console.log("Tentando finalizar corrida no repository:", { ride_id, passenger_user_id });
        
        let sql = `update rides set status = 'F' where ride_id = ? and passenger_user_id = ?`;

        await sqlite.run(sql, [ride_id, passenger_user_id]);

        console.log("Corrida finalizada no repository com sucesso:", ride_id);
        return { ride_id }
    } catch (error) {
        console.error("Erro detalhado ao finalizar corrida:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}

async function ListForDriver(driver_user_id) {
    try {
        console.log("Tentando listar corridas para motorista no repository:", driver_user_id);
        
        let sql = `select r.*, u.name as passenger_name, u.phone as passenger_phone                
        from rides r
        join users u on (u.user_id = r.passenger_user_id)
        where r.pickup_date = CURRENT_DATE
        and  r.driver_user_id = ? 
        
        UNION
        
        select r.*, u.name as passenger_name, u.phone as passenger_phone                
        from rides r
        join users u on (u.user_id = r.passenger_user_id)
        where r.pickup_date = CURRENT_DATE
        and  r.driver_user_id is null 
        `

        const rides = await sqlite.all(sql, [driver_user_id]);
        console.log("Corridas encontradas para motorista no repository:", rides.length);
        return rides;
    } catch (error) {
        console.error("Erro detalhado ao listar corridas para motorista:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}

async function Accept(ride_id, driver_user_id) {
    try {
        console.log("Tentando aceitar corrida no repository:", { ride_id, driver_user_id });
        
        let sql = `update rides set status = 'A', driver_user_id = ? where ride_id = ?`;

        await sqlite.run(sql, [driver_user_id, ride_id]);

        console.log("Corrida aceita no repository com sucesso:", ride_id);
        return { ride_id }
    } catch (error) {
        console.error("Erro detalhado ao aceitar corrida:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}

async function Cancel(ride_id) {
    try {
        console.log("Tentando cancelar corrida no repository:", ride_id);
        
        let sql = `update rides set status = 'P', driver_user_id = null where ride_id = ?`;

        await sqlite.run(sql, [ride_id]);

        console.log("Corrida cancelada no repository com sucesso:", ride_id);
        return { ride_id }
    } catch (error) {
        console.error("Erro detalhado ao cancelar corrida:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}

export default { List, Insert, Delete, Finish, ListForDriver, Accept, Cancel };