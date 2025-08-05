require('dotenv').config();
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.get('/twitter', (req, res) => {
    res.send('Welcome to Twitter');
})


app.get('/login', (req, res) => {
    res.send('Welcome again');
})

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
})