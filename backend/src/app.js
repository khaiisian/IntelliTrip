const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const userRoutes = require('../routes/user.routes');
const categoryRoutes = require('../routes/category.routes');

app.use('/', userRoutes);
app.use('/', categoryRoutes);

module.exports = app;