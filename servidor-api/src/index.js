import express from "express";
import cors from "cors";
import controllerRide from "./controllers/controller.ride.js";
import controllerAuth from "./controllers/controller.auth.js";
import initDatabase from "./database/init-database.js";

const app = express();

// Middlewares...
app.use(express.json());
app.use(cors());

// Auth Routes...
app.post("/auth/login", controllerAuth.Login);
app.post("/auth/register-passenger", controllerAuth.RegisterPassenger);
app.post("/auth/register-driver", controllerAuth.RegisterDriver);
app.post("/auth/recovery", controllerAuth.Recovery);

// Ride Routes...
app.get("/rides", controllerRide.List);
app.post("/rides", controllerRide.Insert);
app.delete("/rides/:ride_id", controllerRide.Delete);
app.get("/rides/:ride_id", controllerRide.ListDetail);

app.put("/rides/:ride_id/finish", controllerRide.Finish);
app.get("/rides/drivers/:driver_user_id", controllerRide.ListForDriver);
app.put("/rides/:ride_id/accept", controllerRide.Accept);
app.put("/rides/:ride_id/cancel", controllerRide.Cancel);

// Inicializar banco de dados e iniciar servidor
async function startServer() {
    try {
        // Inicializar banco de dados
        await initDatabase();
        
        // Iniciar servidor
        app.listen(3001, () => {
            console.log("App running - Port 3001");
        });
    } catch (error) {
        console.error("Erro ao inicializar servidor:", error);
    }
}

startServer();