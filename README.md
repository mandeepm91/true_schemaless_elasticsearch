# An truly schemaless implementation of elasticsearch 

a [Sails](http://sailsjs.org) application

## Pre-requisites:

* Make sure node.js is installed with npm

Steps to follow:

* git clone the project
* navigate to the project directory
*  Run the following command

```
    npm install
    sudo npm install sails -g
    sails lift
```

Server will start on port 1337 by default

Files of interest:

    api/services/Elasticsearch.js
    api/controllers/FileController.js
    api/controllers/SearchController.js

## Major areas of improvement:
    
* Right now the search is performed on _all field only. It would be better to identify the datatypes from query and perform the search on individual fields using a bool query. That will enable to utilize the benefit of storing the fields in their original data types.
* File is first uploaded and then read again into an array, then fed to elasticsearch. I will change to to streaming upload so that file can be indexed to elasticsearch as it is being read. 

