curl -XGET http://f1f003f442dbb7d5873776c95ea47e71.ap-southeast-1.aws.found.io:9200/my_index/_mappings?pretty=1

curl -XGET http://f1f003f442dbb7d5873776c95ea47e71.ap-southeast-1.aws.found.io:9200/my_index?pretty=1

curl -XDELETE http://f1f003f442dbb7d5873776c95ea47e71.ap-southeast-1.aws.found.io:9200/my_index

curl -XPUT http://f1f003f442dbb7d5873776c95ea47e71.ap-southeast-1.aws.found.io:9200/my_index -d  '{
  "settings": {
    "analysis": {
      "filter": {
        "autocomplete_filter": { 
          "type":     "edge_ngram",
          "min_gram": 2,
          "max_gram": 20
        }
      },
      "analyzer": {
        "autocomplete": {
          "type":      "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "autocomplete_filter"
          ]
        }
      }
    }
  }
}'

curl -XPUT http://f1f003f442dbb7d5873776c95ea47e71.ap-southeast-1.aws.found.io:9200/my_index/_mapping/json_docs -d '
{
  "_all" : {"type" : "string", "null_value" : "na", "index" : "analyzed", "index_analyzer" : "autocomplete",  "search_analyzer": "standard"},
  "properties": {
    "tuples": {
      "type": "nested",
      "properties": {
        "field_name": { "type": "string" },
        "text_value": { "type": "string" },
        "num_value": { "type": "double" },
        "date_value": { "type": "date" }
      }
    },
    "source": {
      "type": "object",
      "enabled": false
    }
  }
}'


