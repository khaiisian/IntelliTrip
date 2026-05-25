const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

app.use(cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,               // allow cookies to be sent
}));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const attractionRoutes = require('./routes/attraction.routes');
const expAttractionRoutes = require('./routes/attractionExperience.routes');
const tripRoutes = require('./routes/trip.routes');
const systemConfigRoutes = require('./routes/systemConfig.route');
const authRoutes = require('./routes/auth.routes');
const tripScheduleRoutes = require('./routes/tripSchedule.route');
const tripPreferenceRoutes = require('./routes/tripPreference.route');
const itineraryRoutes = require('./routes/itinerary.routes')

app.use('/', userRoutes);
app.use('/', categoryRoutes);
app.use('/', attractionRoutes);
app.use('/', expAttractionRoutes);
app.use('/', tripRoutes);
app.use('/', systemConfigRoutes);
app.use('/', authRoutes);
app.use('/', tripScheduleRoutes);
app.use('/', tripPreferenceRoutes);
app.use('/', itineraryRoutes);

module.exports = app;
