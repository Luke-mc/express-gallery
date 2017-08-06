app.get('/gallery/id/:edit', (req, res) => {
  Poke.findAll({
      where: {
        fish: req.params.type
      }
    })
    .then((pokes) => {
      pokes.forEach((poke) => {
        console.log(poke.name);
      });
      res.end();
    })
    .catch((err) => {
      console.log(err);
    });
});