var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/lukes_gallery_meta';
var photoMeta = null;

MongoClient.connect(url, function(err, db) {
  photoMeta = db.collection('photoMeta');
  console.log("Connected correctly to server");
});

module.exports = {
  photoMeta: () => photoMeta
};




