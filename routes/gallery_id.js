app.route("/gallery/:id")
  .get((req, res) => {
    var id = parseInt(req.params.id);
    productsDb.getProductId(id)
      .then((data) => {
         res.render('products/product', {
           product: data
         });
      });

  })
  .put((req, res) => {
    console.log("put before: ");
    console.log(allProducts);
    putData(req);
    console.log("put after: ");
    console.log(allProducts);
    res.end();
  })
  .delete((req, res) => {
    console.log("before: ");
    console.log(allProducts);
    deleteData(req);
    console.log("after: ");
    console.log(allProducts);
    res.end();
  });