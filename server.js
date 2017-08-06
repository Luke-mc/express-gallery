const express = require ('express');
const PORT = process.env.PORT || 3000;
const db = require('./models');
const app = express();
const bp = require('body-parser');
const exphbs = require('express-handlebars');

app.use(bp.urlencoded());


const server = app.listen(PORT, () => {
  db.sequelize.sync();
  console.log(`Server running ${PORT}`);
});