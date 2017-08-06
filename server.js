const express = require ('express');
const PORT = process.env.PORT || 3000;
const db = require('./models');
const app = express();
const bp = require('body-parser');
const exphbs = require('express-handlebars');
const methodOverride = require("method-override");
const Gallery = db.Gallery;

app.use(bp.urlencoded());

app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride(function(req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

const hbs = exphbs.create({
  defaultLayout: "main",
  extname: ".hbs"
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");


app.get('/', (req, res) => {
  Gallery.findAll()
    .then((picture) => {
      console.log(picture);
      res.render("partials/index", {
        data: picture
     });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/gallery/new', (req, res) => {
  errorMessage = null;
  res.render('partials/edit', {
    error: errorMessage
  });
});

app.post("/gallery-submission", (req, res) => {
    Gallery.create({
      author: req.body.author,
      link: req.body.link,
      description: req.body.description
    }).then((data) => {
      console.log(data);
      console.log('created a new PIC');
      res.end();
    }).catch((err) => {
      console.log(err);
    });
    res.redirect("/");
});

app.post('/gallery', (req, res) => {
  console.log(req.body);
  Gallery.create({
    author: req.body.author,
    link: req.body.link,
    description: req.body.description
  }).then((data) => {
    console.log(data);
    console.log('created a new PIC');
    res.end();
  }).catch((err) => {
    console.log(err);
  });
});

app.route("/gallery/:id")
  .get((req, res) => {
Gallery.findById(parseInt(req.params.id))
    .then((picture) => {
    res.render("partials/id", {
        picture: picture
     });
    })
    .catch((err) => {
      console.log(err);
    });
  });

  app.route("/gallery/:id")
    .put((req, res) => {
     console.log('Put route hit');
     Gallery.update({
        author: req.body.author,
        link: req.body.link,
        description: req.body.description
     },
     {
        where: {
          id: parseInt(req.params.id)
        }
    }).then((data) => {
        console.log('complete');
        res.redirect("/");

      }).catch((err) => {
        console.log(err);
      });

  });

  app.get("/gallery/:id/edit", (req, res) => {
    Gallery.findById(parseInt(req.params.id))
     .then((picture) => {
       res.render("partials/edit", {
       picture: picture
     });
    })
    .catch((err) => {
      console.log(err);
    });
  });


const server = app.listen(PORT, () => {
  db.sequelize.sync();
  console.log(`Server running ${PORT}`);
});

