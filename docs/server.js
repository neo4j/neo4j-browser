const express = require('express')

const app = express()
app.use(express.static('./build/site'))

app.use('/static/assets', express.static('./build/site/assets'))

app.get('/', (req, res) => res.redirect('/docs/'))

app.listen(8002, () => console.log('📘 http://localhost:8002'))
