# ANSTAGRAM

=========

Anstagram is an APP + API that allows for searches for [anagrams](https://en.wikipedia.org/wiki/Anagram). Currently you can lookup anagrams (in the english language) for a set of letters/or a word using the interface. Additionally, you can interact with the api as described below. 

### ABOUT THE API

[Live App + Endpoint](https://anstagram-app.herokuapp.com/)

Clients can interact with the API over HTTP, and all data sent and received is expected to be in JSON format. Some examples (assuming the API is being served on localhost port 3000):

USAGE 
(note the deployed herokuapp has DELETE functionality disabled and the hobby-dev status will limit total data  and have some performance limits automatically because... It basically goes to sleep when it's not in use. But it's free :) )

```{bash}
# Adding words to the corpus
$ curl -i -X POST -d '{ "words": ["read", "dear", "dare"] }' http://localhost:3000/words.json
HTTP/1.1 201 Created
...

# Fetching anagrams
$ curl -i http://localhost:3000/anagrams/read.json
HTTP/1.1 200 OK
...
{
  anagrams: [
    "dear",
    "dare"
  ]
}

# Specifying maximum number of anagrams
$ curl -i http://localhost:3000/anagrams/read.json?limit=1
HTTP/1.1 200 OK
...
{
  anagrams: [
    "dare"
  ]
}

# Delete single word (Disabled on Live App)
$ curl -i -X DELETE http://localhost:3000/words/read.json
HTTP/1.1 204 No Content
...

# Delete all words (Disabled on Live App)
$ curl -i -X DELETE http://localhost:3000/words.json
HTTP/1.1 204 No Content
...

# Get info on the words currently in the Dictionary
$ curl -i http://localhost:3000/words/info
HTTP/1.1 200 OK
{
    "info": {
        "avg": "9.57",
        "median": 9,
        "max": 24,
        "min": 1,
        "count": "235886"
    }
}

# Gets the largest group of anagrams/word with the most anagrams
$ curl -i http://localhost:3000/anagrams/max
HTTP/1.1 200 OK
{
    "mostAnagrams": [
        "caret",
        "carte",
        "cater",
        "recta",
        "crate",
        "creat",
        "creta",
        "react",
        "trace"
    ]
}

# Endpoint to return all letter groups for anagrams of size >= *x*
# Subsequent calls to the API for the words with these letter groups
# would be used to find the corresponding english words
$ curl -i http://localhost:3000/anagrams/groups?size=8
{
  "anagramGroups":[
    {"letters_id":"acert","anagrams":"9"},
    {"letters_id":"agnor","anagrams":"9"},
    {"letters_id":"eerst","anagrams":"9"},
    {"letters_id":"aelpt","anagrams":"8"},
    {"letters_id":"aelrst","anagrams":"8"}
    ]
}

```

**Note:** a word is not considered to be its own anagram.

## Running Locally

You will need:
- Node - running the application
- PostgreSQL - data storage
- Heroku cli - for deployment/heroku account
- Ruby - for testing
- npm - application dependencies/script runner
- git / Github account

1. Clone Repo.

  ```{bash}
    git clone <REPO NAME>
  ```

1. Install dependencies.

  ```{bash}
    npm install
  ```

1. Create Env Databases for development and testing locally

  ```{bash}
    psql
    CREATE DATABASE <DATABASE NAME>
  ```

1. Configure knexfile with [appropriate connections](knexfile.js). Use the databases created previously. Run the knex migration and seed the data store.

  ```{base}
    knex migrate:latest
    knex seed:run
  ```


## Testing

To run the tests you must have Node/NPM + Ruby installed ([docs](https://www.ruby-lang.org/en/documentation/installation/)). Then run them with following CLI commands from the root directory:

Start the Test Server

```{bash}
npm run test
```

Run the tests against the concurrently running server. As you develop the test env is kept running with `nodemen` to easily test code changes as you go.

```{bash}
npm run testrun
```

Run the tests manually (optional -h for testing other than localhost)

```{bash}
ruby tests anagram_test.rb -h
```

## API Client

An API client in `anagram_client.rb` has been provided. This is used in the test suite, and can also be used in development (helpful for troubleshooting when running the app with nodemon or the `npm run dev`, `npm run test`).

To run the client in the Ruby console, use `irb`:

```{ruby}
$ irb
> require_relative 'tests/anagram_client'
> client = AnagramClient.new
> client.post('/words.json', nil, { 'words' => ['read', 'dear', 'dare']})
> client.get('/anagrams/read.json')
```

## Implementation Details

Refer to the [package.json](./package.json) for a full listing of project dependencies.

**Data Storage**

I chose to use a PostgreSQL database to have indexing and SQL querying available for potentially complex querying. Also, this is a tool I've used with Node and Rails and is quick to get plugged in with dev, staging, and prod localled and on Heroku.

**Discussion**

**Node Async vs Sync** when ingesting the data store/seeding the postgres database: Attempting to read a large text file with node, ingesting the data, then inserting to a database through a db connection like PG requires managing operations to prevent consuming too much memory. This leds to exploring Node streams and how the V8 engine is working with the File System, sync vs async. Node offers a file system api which is synchronous by default. I used Knex, a popular query builder, to create and manage queryies. Knex takes advantage of Promises by default. Even utilizing promises, with the larger seed file, I had to research ways to get more efficient inserting. A combination of a node data stream - ingesting the file in chunks - then using knex to insert rows worked fine.

**Node + PG + Knex:** I chose to use node because I am more comfortable with the javascript landscape. That said - I think the API Design could be optimized for performance by using different model structure with SQL, choosing a NoSQL store or with a serverless/lambda implimentation. It would be interesting to compare performance differences. For some of the optional routes I reached for raw queryies versus Knex methods to save time/improve the query.

According to documentation a NoSQL implimentation (DynamoDB or Redis) would be the ideal step for near-instant data retrieval. This might also allow for a lightweight/free AWS deployment. There's [tutorials on this](https://serverless.com/blog/node-rest-api-with-serverless-lambda-and-dynamodb/), which may be a worthwhile rabbit hole to explore to compare performance. See [SQL vs NoSQL](https://www.xplenty.com/blog/the-sql-vs-nosql-difference/) for more discussion on the topic and use cases.

## Looking Forward

Features that may be useful to add to the API:

- Move to aws lambda + gateway
- Data Visualization for the crypto nerds out there. E.g. visual of distributions of anagrams across letters, word length, etc.
- Browser Extension - shuffle words on the go. Win at Scrabble any time??? Import the official scrabble library.
- Internationalization. Are anagrams a concept that exists in all languages? Find a linguist to chime in.
- More security on the DB, experiment with vanilla pg instead of using Knex.js
- Try [benchmark-bigo](https://github.com/davy/benchmark-bigo) for performance testing on your implementation
- Test and production tooling like [PM2](http://pm2.keymetrics.io/docs/usage/quick-start/). It would be interesting to compare a different data storage method to PSQL.
