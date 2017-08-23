const express = require ('express');
const PORT = process.env.PORT || 3000;
const db = require('./models');
const app = express();
const redis = require('redis');
const bp = require('body-parser');
const exphbs = require('express-handlebars');
const methodOverride = require("method-override");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const Gallery = db.Gallery;
const User = db.User;
var helpers = require('handlebars-helpers')();
const bcrypt = require('bcrypt');
const photoMeta = require('./collections/mongodb_meta.js').photoMeta;
const saltRounds = 10;
let loggedIn = false;

app.use(bp.urlencoded());

app.use(session({
  store: new RedisStore(),
  secret: 'Keyboard Cat',
  name: 'super_sessions',
  cookie: {
    maxAge: 1000000
  },
  saveUninitialized: true
}));

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

app.use(passport.initialize());

app.use(passport.session());


      //Passport code here//

 passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log('client side username', username);
    console.log('client side password', password);
    User.findOne({
      where: {
        username: username
      }
    }).then((user) => {
      console.log('User exists in DB');
      let userHashPassword = user.password;
      console.log(userHashPassword);
      console.log(password);
      bcrypt.compare(password, userHashPassword, (err, result) => {
        if (err) {
          console.log(err);
          return done(err);
        }
        if(result) {
          return done(null, user);
        }else{
          return done(null, false, {message: 'Incorrect password'});
        }
      });
    }).catch((err) => {
      console.log('username not found');
      console.log(err);
      return done(null, false, {message: ' Incorrect Username'});
    });
  }
));

passport.serializeUser((user, done) => {
  console.log('serializing user into session');
  done (null, user.id);
});

passport.deserializeUser((userId, done) => {
  console.log('adding user info into request object');
  User.findOne({
    where: {
      id:userId
    }
  }).then((user) => {
    console.log('test 1');
    return done(null, {
      id: user.id,
      username: user.username
    });
  }).catch((err) => {
    done(err, user);
  });
});


app.use(express.static("public"));

app.get('/login', (req, res) => {
  errorMessage = null;
  res.render('partials/login', {
    error: errorMessage,
    log: loggedIn
  });

});

app.get('/createuser', (req, res) => {
  errorMessage = null;
  res.render('partials/create_user', {
    error: errorMessage,
    log: loggedIn
  });
});

app.post("/createuser-submission", (req, res) => {
  bcrypt.genSalt(saltRounds, (errr, salt) => {
     bcrypt.hash(req.body.password, salt, (err, hash) => {
        User.create({
          username: req.body.username,
          password: hash,
        }).then((data) => {
          console.log('created a new user');
          res.redirect('/');

        }).catch((err) => {
          console.log(err);
        });
      });
   });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/gallery/new',
  failureRedirect: '/login'
}));

app.get('/logout', function(req, res){
  loggedIn = false;
  req.logout();
  res.redirect('/');
});

// app.get('/secret', userAuthenticated, (req, res) => {
//   console.log(req.user);
//   res.send('this is the secret');
// });

function userAuthenticated (req, res, next){
  if (req.isAuthenticated()){
    console.log('user is good!');
    next();
  }else{
    console.log('user not good');
    res.redirect('/login');
  }
}

app.get('/', (req, res) => {
  Gallery.findAll()
    .then((picture) => {
      res.render("partials/index", {
        data: picture,
       });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/gallery/new', (req, res) => {
  errorMessage = null;
  res.render('partials/new', {
    error: errorMessage,
  });
});

app.post("/gallery-submission", (req, res) => {
    Gallery.create({
      author: req.body.author,
      link: req.body.link,
      description: req.body.description
    }).then((data) => {
      console.log(req.body);
      console.log(req.params.id);
      var metaTags = {
        id: req.body.id,
        meta: req.body.meta
      };
      photoMeta().insertOne(metaTags);
      console.log('created a new PIC');
      res.redirect("/");
    }).catch((err) => {
      console.log(err);
    });
});

app.route("/gallery/:id")
  .get((req, res) => {
     Gallery.findById(parseInt(req.params.id))
      .then((data) => {
      res.render("partials/id", {
        data: data,
        log: loggedIn
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
       picture: picture,
       log: loggedIn
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

