/**
 * SearchController
 *
 * @description :: Server-side logic for managing searches
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	search: function (req, res){
		var packet = req.params.all();
		Elasticsearch.search(packet.query).then(function (result){
			return res.json(200, result);
		}).caught(function (err){
			sails.log.error("[SearchController.search]", err);
			return res.json(500, {"error": err});
		});
	}
};

