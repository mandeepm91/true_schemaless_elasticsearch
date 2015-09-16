curl -XGET http://f1f003f442dbb7d5873776c95ea47e71.ap-southeast-1.aws.found.io:9200/my_index/_mappings?pretty=1

curl -XDELETE http://f1f003f442dbb7d5873776c95ea47e71.ap-southeast-1.aws.found.io:9200/my_index/json_docs

curl -XPUT http://f1f003f442dbb7d5873776c95ea47e71.ap-southeast-1.aws.found.io:9200/my_index

curl -XPUT http://f1f003f442dbb7d5873776c95ea47e71.ap-southeast-1.aws.found.io:9200/my_index/_mapping/json_docs -d '
{
	"properties": {
		"tuples": {
			"type": "nested":,
			"properties": {
				"field_name": { "type": "string" },
				"text_value": { "type": "string" },
				"num_value": { "type": "double" },
				"date_value": { "type": "dateOptionalTime" }
			}
		}
	}
}'
