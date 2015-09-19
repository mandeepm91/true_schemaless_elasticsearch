
var elasticsearch = require('elasticsearch');
var async = require('async');
var Promise = require('bluebird-extra')

var esConfig = {
  host: "http://f1f003f442dbb7d5873776c95ea47e71.ap-southeast-1.aws.found.io:9200",
  log: "error"
}

var esClient = elasticsearch.Client(esConfig)
var fs = require('fs')
var path = require('path');
var _ = require("lodash");

Promise.promisifyAll(fs);

module.exports = {
  removeAll: removeAll,
  transFormInputDoc: transFormInputDoc,
  search: search,
  count: count,
  indexDocument: indexDocument,
  indexFileContentsToElasticSearch: indexFileContentsToElasticSearch

  // processArray: processArray,  
  // addPrefix: addPrefix,
  // test: test,
  // jsonToTuples: jsonToTuples
}


function indexFileContentsToElasticSearch(arrayOfObjects){
  var count = 0;
  var bulkRequestBody = [];
  arrayOfObjects.forEach(function (jsonObject){
    count++;
    sails.log.info("[Elasticsearch.indexFileContentsToElasticSearch]", count);
    var doc = _.cloneDeep(transFormInputDoc(jsonObject));
    bulkRequestBody.push({"index": {"_index": "my_index", "_type": "json_docs"}});
    bulkRequestBody.push(doc);
  })
  sails.log.info("[Elasticsearch.indexFileContentsToElasticSearch] indexing");
  return esClient.bulk({
    "body": bulkRequestBody
  }).then(function (result){
    sails.log.info("indexed", count);
    return count
  });
}



function test(){
  return esClient.ping().then(sails.log);
}


function count(){
  return esClient.count({
    "index": "my_index",
    "type": "json_docs"
  }).then(function (result){
    return result
  })    
}


function search(query){
  return esClient.search({
    "index": "my_index",
    "type": "json_docs",
    "body": {
      "query": {
        "match": {
          "_all": query
        }
      }
    }
  }).then(function (result){
    return result.hits.hits
  })
}

function addPrefix(key, tuples){
  tuples.forEach(function (tuple){
    tuple.field_name = key + "." + tuple.field_name
  })
}

function transFormInputDoc(doc){
  return {
    "source": doc,
    "tuples": jsonToTuples(doc)
  }
}

function processArray(array){
  var typeKeyMap = {
    "string": "text_value",
    "number": "num_value",
    "date": "date_value"
  }
  function getDataType(elem){
    if(typeof elem == "string"){
      return "string"
    } else if (typeof elem == "number"){
      return "number"
    } else if(typeof elem == "object" && Object.prototype.toString.call(elem) === '[object Date]'){
      return "date"
    }
  }
  var valueObject = {}
  if(array && array.length > 0){
    var mainDataType = getDataType(array[0])
    if(mainDataType){
      valueObject["key"] = typeKeyMap[mainDataType] 
      valueObject["values"] = [array[0]]
      for(var i = 1; i < array.length && getDataType(array[i]) == mainDataType; i++){
        valueObject.values.push(array[i])
      }
      if(i!=array.length){
        delete valueObject["key"]
      }
    }
  }
  if(valueObject.key){
    return valueObject
  }
}

function jsonToTuples(doc){
  var tuples = []
  Object.keys(doc).forEach(function (key){
    var tupleObject = { "field_name": key };
    if (typeof doc[key] == "string"){
      tupleObject["text_value"] = doc[key]
    } else if (typeof doc[key] == "number"){
      tupleObject["num_value"] = doc[key]
    } else if (typeof doc[key] == "object" && Object.prototype.toString.call(doc[key]) === '[object Date]'){
      tupleObject["date_value"] = doc[key]
    } else if (typeof doc[key] == "object" && Object.prototype.toString.call(doc[key]) === '[object Object]'){
      var subTuples = jsonToTuples(doc[key]);
      addPrefix(key, subTuples);
    } else if (typeof doc[key] == "object" && Object.prototype.toString.call(doc[key]) === '[object Array]'){
      var valueObject = processArray(doc[key])
      if(valueObject){
        tupleObject[valueObject["key"]] = valueObject["values"]
      } else {
        tupleObject = null
      }
    }
    if(subTuples){
      tuples.push.apply(tuples, subTuples);          
    } else if (tupleObject){
      tuples.push(tupleObject)    
    }
  })
  return tuples
}


function indexDocument(content){
  var body = content
  return esClient.index({
    "index": "my_index",
    "type": "json_docs",
    "body": body
  })
}


// just for development purpose
// need to disable this in production
function removeAll(){
  return esClient.deleteByQuery({
    "index": "my_index",
    "type": "json_docs",
    "body": {
      "query": {
        "match_all": {}
      }
    }
  })
}



// some data for testing on console
// var testObject1 = {
//   "key1": 12213.12213,
//   "key2": "gggs",
//   "key3": new Date(),
//   "key4": {
//     "subKey1": 4,
//     "subKey2": "some text"
//   } 
// }

// var input = {
//   "id" : 123,
//   "message" : "free ponies!",
//   "author" : {
//     "id" : "abc",
//     "name" : "benji",
//     "address": {
//       "line1": "B 1",
//       "city": "Delhi",
//       "postal_code": 110058
//     }
//   },
//   "numbers": [1,2,3,4,5],
//   "tags": ["hello", "hi"],
//   "dates": [new Date(0), new Date()],
//   "comments": ["hello", "blah blah", 45, 67, {"key": 1, "value": "more nesting"}]
// }


// var testObject2 = {
//   "key1": "12213",
//   "key2": "gggs",
//   "key3": new Date()
// }