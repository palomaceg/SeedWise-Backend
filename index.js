require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const cors = require("cors");
const { dbConnection } = require("./config/config");

dbConnection();

//MIDDLEWARE
app.use(express.json());
app.use(cors());

//ENDPOINTS
app.use("/module", require("./routes/moduleRoutes"));
app.use("/session", require("./routes/sessionRoutes"));

//SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor arriba en http://localhost:${PORT}`);
});
