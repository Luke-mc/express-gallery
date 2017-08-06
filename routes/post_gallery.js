app.post('/gallery', (req, res) => {
  Poke.create({
    name: req.body.name,
    fish: req.body.fish
  }).then((data) => {
    console.log(data);
    console.log('created a new poke');
    res.end();
  }).catch((err) => {
    console.log(err);
  });
});