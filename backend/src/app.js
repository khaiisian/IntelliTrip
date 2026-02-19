const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const userRoutes = require('../routes/user.routes');
const categoryRoutes = require('../routes/category.routes');
const attractionRoutes = require('../routes/attraction.routes');
const expAttractionRoutes = require('../routes/attractionExperience.routes');

app.use('/', userRoutes);
app.use('/', categoryRoutes);
app.use('/', attractionRoutes);
app.use('/', expAttractionRoutes);

module.exports = app;