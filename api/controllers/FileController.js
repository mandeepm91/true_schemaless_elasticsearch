/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var fs = require("fs");
var path = require("path");

module.exports = {

	upload: function (req, res){
		var filePath = path.join(process.env.HOME, "Downloads/file.json");
		var array = JSON.parse(fs.readFileSync(filePath).toString());
		Elasticsearch.indexFileContentsToElasticSearch(array).then(function (done){
			return res.json(200, {"status": 1});
		}).caught(function (err){
			sails.log.error("FileController.upload", err);
			return res.json(500, err);
		})
	}
	
};

