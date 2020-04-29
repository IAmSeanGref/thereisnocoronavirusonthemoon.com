const path = require('path')
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'dist', 'index.html'))
})

app.get('/assets/index.js', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'dist', 'index.js'))
})

app.use('/assets', express.static(path.join(__dirname, '..', 'assets')))

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})