import repositoryRide from "../repositories/repository.ride.js";

async function List(passenger_user_id, pickup_date, ride_id, driver_user_id, status, status_not) {
    try {
        console.log("Listando corridas com filtros:", { passenger_user_id, pickup_date, ride_id, driver_user_id, status, status_not });
        
        const rides = await repositoryRide.List(passenger_user_id, pickup_date,
            ride_id, driver_user_id, status, status_not);

        console.log("Corridas encontradas:", rides.length);
        return rides;
    } catch (error) {
        console.error("Erro no service List:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}

async function Insert(passenger_user_id, pickup_address,
    pickup_latitude, pickup_longitude, dropoff_address) {
    try {
        console.log("Tentando inserir corrida:", { passenger_user_id, pickup_address, dropoff_address });

        // Validacao: O usuario so pode pedir uma carona por vez
        const dt = new Date().toISOString("pt-BR", { timeZone: "America/Sao_Paulo" }).substring(0, 10);
        const searchRides = await List(passenger_user_id, dt, null, null, null, "F");

        if (searchRides.length > 0) {
            throw new Error("Você já possui uma carona não finalizada no dia de hoje");
        }
        //------------retorno

        const ride = await repositoryRide.Insert(passenger_user_id, pickup_address,
            pickup_latitude, pickup_longitude, dropoff_address);

        console.log("Corrida inserida com sucesso:", ride);
        return ride;
    } catch (error) {
        console.error("Erro no service Insert:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}

async function Delete(ride_id) {
    try {
        console.log("Tentando deletar corrida:", ride_id);
        
        const ride = await repositoryRide.Delete(ride_id);

        console.log("Corrida deletada com sucesso:", ride);
        return ride;
    } catch (error) {
        console.error("Erro no service Delete:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}

async function Finish(ride_id, passenger_user_id) {
    try {
        console.log("Tentando finalizar corrida:", { ride_id, passenger_user_id });
        
        const ride = await repositoryRide.Finish(ride_id, passenger_user_id);

        console.log("Corrida finalizada com sucesso:", ride);
        return ride;
    } catch (error) {
        console.error("Erro no service Finish:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}

async function ListForDriver(driver_user_id) {
    try {
        console.log("Listando corridas para motorista:", driver_user_id);
        
        const rides = await repositoryRide.ListForDriver(driver_user_id);

        console.log("Corridas encontradas para motorista:", rides.length);
        return rides;
    } catch (error) {
        console.error("Erro no service ListForDriver:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}

async function Accept(ride_id, driver_user_id) {
    try {
        console.log("Tentando aceitar corrida:", { ride_id, driver_user_id });

        // Validacao: O motorista só pode aceitar uma carona por vez
        const dt = new Date().toISOString("pt-BR", { timeZone: "America/Sao_Paulo" }).substring(0, 10);
        const searchRides = await List(null, dt, null, driver_user_id, "A", null);

        if (searchRides.length > 0) {
            throw new Error("Você já possui uma corrida aceita no dia de hoje para: " + searchRides[0].passenger_name);
        }
        //----------------------------------

        const ride = await repositoryRide.Accept(ride_id, driver_user_id);

        console.log("Corrida aceita com sucesso:", ride);
        return ride;
    } catch (error) {
        console.error("Erro no service Accept:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}

async function Cancel(ride_id) {
    try {
        console.log("Tentando cancelar corrida:", ride_id);
        
        const ride = await repositoryRide.Cancel(ride_id);

        console.log("Corrida cancelada com sucesso:", ride);
        return ride;
    } catch (error) {
        console.error("Erro no service Cancel:", error);
        throw new Error("Erro ao conectar com o banco: " + error.message);
    }
}


export default { List, Insert, Delete, Finish, ListForDriver, Accept, Cancel };