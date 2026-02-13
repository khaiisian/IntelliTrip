const env = require('../config/env');
const app = require('./app');

const PORT = env.port ||  5000;

app.listen(PORT, ()=>{
    console.log(`Backend running on port ${PORT}`)
})