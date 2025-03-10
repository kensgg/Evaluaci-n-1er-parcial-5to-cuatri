import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import usuariosRutas from "./routes/usuariosRutas.js";
import { conectarDB } from "./db/db.js";

async function conexionBD(){
    var mensajeDB = await conectarDB();
    console.log(mensajeDB);
}
const app = express();
conexionBD();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3001', // Replace with your client URL
  credentials: true // Allow credentials (cookies, authorization headers)
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use("/api", usuariosRutas);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});
