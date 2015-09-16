
var elasticsearch = require('elasticsearch');
var async = require('async');
var Promise = require('bluebird')

var esConfig = {
  host: "http://f1f003f442dbb7d5873776c95ea47e71.ap-southeast-1.aws.found.io:9200",
  log: "error"
}

var esClient = elasticsearch.Client(esConfig)
var fs = require('fs')
var path = require('path');

Promise.promisifyAll(fs);

module.exports = {
  addPrefix: addPrefix,
  test: test,
  search: search,
  count: count,
  indexDocument: indexDocument,
  jsonToTuples: jsonToTuples
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

    }
    if(subTuples){
      tuples.push.apply(tuples, subTuples);          
    } else{
      tuples.push(tupleObject)    
    }
  })
  return tuples
}


function indexDocument(content){
  var body = {
    "content": content
  }
  return esClient.index({
    "index": "my_index",
    "type": "json_docs",
    "body": body
  })
}


var testObject1 = {
  "key1": 12213.12213,
  "key2": "gggs",
  "key3": new Date(),
  "key4": {
    "subKey1": 4,
    "subKey2": "some text"
  } 
}

var input = {
  "id" : 123,
  "message" : "free ponies!",
  "author" : {
    "id" : "abc",
    "name" : "benji",
    "address": {
      "line1": "B 1",
      "city": "Delhi",
      "postal_code": 110058
    }
  },
  "comments": ["hello", "blah blah", 45, 67, {"key": 1, "value": "more nesting"}]
}

var testObject2 = {
  "key1": 12213,
  "key2": "gggs",
  "key3": new Date()
}