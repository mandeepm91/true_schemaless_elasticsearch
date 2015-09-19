/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var fs = require("fs");
var path = require("path");

var UPLOAD_PATH = path.join(process.env.HOME, "uploads")

module.exports = {

  upload: function (req, res){
    req.file('json').upload({
      // don't allow the total upload size to exceed ~10MB
      maxBytes: 10000000
    },function whenDone(err, uploadedFiles) {
      if (err) {
        return res.negotiate(err);
      }

      // If no files were uploaded, respond with an error.
      if (uploadedFiles.length === 0){
        return res.badRequest('No file was uploaded');
      }

      var file = uploadedFiles[0];
      var inputFile = fs.createReadStream(file.fd);
      var filePath = path.join(UPLOAD_PATH, file.filename)
      var outputFile = fs.createWriteStream(filePath);
      inputFile.pipe(outputFile);

      outputFile.on("close", function (){
        sails.log.info("uploadedFiles");
        var fileContents = fs.readFileSync(filePath);
        sails.log.info("reading file");
        try {
          var arrayOfObjects = JSON.parse(fileContents.toString());
          sails.log.info("parsed file");
          if(typeof arrayOfObjects == "object" && Object.prototype.toString.call(arrayOfObjects) === '[object Array]'){
            Elasticsearch.indexFileContentsToElasticSearch(arrayOfObjects).then(function (count){
              sails.log.info("indexed",  count);
              return res.json(200, {"status": 1});
            });
          } else {
            throw "invalid file format"
          }
        } catch (err){
          sails.log.error(err);
          return res.json(500, {"error": err})
        }
      });

    }) 

  }
  
};

