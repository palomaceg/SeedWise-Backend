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
app.use('/user', require('./routes/users'));
app.use('/startup', require('./routes/startup'));
app.use("/module", require("./routes/moduleRoutes"));
app.use("/session", require("./routes/sessionRoutes"));
app.use('/trainers', require('./routes/trainer'));
app.use('/mentors', require('./routes/mentoring'));
app.use('/activity', require('./routes/activity'))

//SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor arriba en http://localhost:${PORT}`);
});
