const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,               // allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser());

const userRoutes = require('../routes/user.routes');
const categoryRoutes = require('../routes/category.routes');
const attractionRoutes = require('../routes/attraction.routes');
const expAttractionRoutes = require('../routes/attractionExperience.routes');
const tripRoutes = require('../routes/trip.routes');
const authRoutes = require('../routes/auth.routes');

app.use('/', userRoutes);
app.use('/', categoryRoutes);
app.use('/', attractionRoutes);
app.use('/', expAttractionRoutes);
app.use('/', tripRoutes);
app.use('/', authRoutes);

module.exports = app;