app.get('/', (req, res) => {
  Poke.findAll()
    .then((pokes) => {
      console.log(pokes[0].name);
      res.json();
    })
    .catch((err) => {
      console.log(err);
    });
});