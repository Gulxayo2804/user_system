const express = require('express');
const app= express();
const cors = require('cors');
const bodyParser= require('body-parser')
const connectDB= require('./config/db')

connectDB();
app.use(bodyParser.json());
app.use(cors());

app.use('/api/user', require('./routes/user'));

const PORT= process.env.PORT || 5000
app.listen(PORT, () =>{
    console.log(`Server is running to ${PORT}`)
})