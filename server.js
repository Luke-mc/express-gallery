const express = require ('express');
const PORT = process.env.PORT || 3000;
const db = require('./models');
const app = express();
const bp = require('body-parser');
const exphbs = require('express-handlebars');
const methodOverride = require("method-override");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const Gallery = db.Gallery;

app.use(bp.urlencoded());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());

app.use(passport.session());


      //Passport code here//

//       passport.use(new LocalStrategy(
//   function(username, password, done) {
//     console.log('client side username', username);
//     console.log('client side password', password);
//     User.findOne({
//       where: {
//         username: username
//       }
//     }).then((user) => {
//       console.log('User exists in DB');
//       if(user.password === password){
//         console.log('username and password successful');
//         return done(null, user);
//       }else{
//         console.log('Password incorrect');
//         return done(null, false, {message: ' Incorrect password'});
//       }
//     }).catch((err) => {
//       console.log('username not found');
//       console.log(err);
//       return done(null, false, {message: ' Incorrect Username'});
//     });
//   }
// ));

// passport.serializeUser((user, done) => {
//   console.log('serializing user into session');
//   done (null, user.id);
// });

// passport.deserializeUser((userId, done) => {
//   console.log('adding user info into request object');
//   User.finOne({
//     where: {
//       id:userId
//     }
//   }).then((user) => {
//     return (null, {
//       id: user.id,
//       username: user.username
//     });
//   }).catch((err) => {
//     done(err, user);
//   });
// });


app.use(express.static("public"));

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
  res.render('partials/new', {
    error: errorMessage
  });
});

app.post("/gallery-submission", (req, res) => {
    Gallery.create({
      author: req.body.author,
      link: req.body.link,
      description: req.body.description
    }).then((data) => {
      //console.log(data);
      console.log('created a new PIC');
      res.redirect("/");
    }).catch((err) => {
      console.log(err);
    });

});

app.post('/gallery/new', (req, res) => {
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

  })
  .delete((req, res) => {
    Gallery.destroy({
        where: {
          id: parseInt(req.params.id)
        }
      }).then((data) => {
          console.log('Deleted');
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

