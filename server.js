const express = require('express');
require('dotenv').config();
const app = express();
const port = 3000;


const voiesRoutes = require('./routes/voies');
const advRoutes = require('./routes/adv');


app.use(express.static('public'));


app.use(voiesRoutes);
app.use(advRoutes);

app.listen(port, () => {
  console.log(`🚀 Serveur Express en ligne : http://localhost:${port}`);
});
