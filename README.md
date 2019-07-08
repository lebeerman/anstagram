# ANSTAGRAM

=========

Anstagram is an APP + API that allows fast searches for [anagrams](https://en.wikipedia.org/wiki/Anagram). Currently you can lookup anagrams (in the english language) for a set of letters/or a word.

---

**MVP**

- [X] `POST /words.json`: Takes a JSON array of English-language words and adds them to the corpus (data store).
- [X] `GET /anagrams/:word.json`:
  - [X]  Returns a JSON array of English-language words that are anagrams of the word passed in the URL.
  - [X]  This endpoint should support an optional query param that indicates the maximum number of results to return.
- [X] `DELETE /words/:word.json`: Deletes a single word from the data store. NOTE - this should be protected or disabled in PROD
- [X] `DELETE /words.json`: Deletes all contents of the data store. NOTE - this should be protected or disabled in PROD

**DEPLOY**

- [X] [heroku app link](https://anstagram-app.herokuapp.com/)
- Considering: aws, azure, GCP, firebase, try serverless, or dockerized approach?

**Optional/Stretch**
TODO - Add Tests and Update test runner script
- [X] Endpoint that returns a [X] count of words in the corpus and [X] min/max/median/average word length
- [X] Respect a query param for whether or not to include proper nouns in the list of anagrams
- [X] Endpoint that identifies words with the most anagrams
- [X] Endpoint that takes a set of words and returns whether or not they are all anagrams of each other
- [~] Endpoint to return all anagram groups of size >= *x* NOTE: This sort of works.
- [X] Endpoint to delete a word *and all of its anagrams*

---

### ABOUT THE API

Clients can interact with the API over HTTP, and all data sent and received is expected to be in JSON format. Some examples (assuming the API is being served on localhost port 3000):

USAGE

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

# Delete single word
$ curl -i -X DELETE http://localhost:3000/words/read.json
HTTP/1.1 204 No Content
...

# Delete all words
$ curl -i -X DELETE http://localhost:3000/words.json
HTTP/1.1 204 No Content
...
```

**Note:** a word is not considered to be its own anagram.

## Running Locally

You will need:
- Node - running the application
- PostgreSQL - data storage
- Heroku cli - for deployment
- Ruby - for testing
- npm - application dependencies/script runner




## Testing

To run the tests you must have Ruby installed ([docs](https://www.ruby-lang.org/en/documentation/installation/)). Then run them with following CLI commands from the root directory:

Start the Test Server
```{bash}
npm run test
```

Run the tests against the running server
```{bash}
npm run testrun
```

Run the tests manually (optional -h for testing other than localhost)
```{bash}
ruby tests anagram_test.rb -h
```

## API Client

We have provided an API client in `anagram_client.rb`. This is used in the test suite, and can also be used in development.

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

Node Async vs Sync when ingesting the data store/seeding the postgres database: Attempting to read a large text file with node, ingesting the data, then inserting to a database through a db connection like PG requires managing operations to prevent consuming too many resources. This lead into the core of Node and how the V8 engine is working with the File System. Node offers a file system api which is synchronous by default. I was using Knex, a query builder, to create and manage queryies. Knex takes advantage of Promises by default. Even utilizing promises, with the larger seed file, I had to research ways to get more efficient inserting. A combination of a node data stream - ingesting the file in chunks - then using knex to insert rows worked fine.

Node + PG + Knex: I chose to use node because I am more comfortable with the javascript landscape. That said - I think the API Design could be optimized for performance by using different model structure with SQL, choosing a NoSQL store or with a serverless/lambda implimentation. It would be interesting to compare performance differences. For some of the optional routes I reached for raw queryies versus Knex methods to same time.

According to documentation a NoSQL implimentation (DynamoDB or Redis) would be the ideal step for near-instant data retrieval. This would also allow for a lightweight/free AWS deployment. In fact, there's [tons of tutorials on this](https://serverless.com/blog/node-rest-api-with-serverless-lambda-and-dynamodb/), maybe I'll have time to try it out. See [SQL vs NoSQL](https://www.xplenty.com/blog/the-sql-vs-nosql-difference/) for more discussion on the topic and use cases - a valuable rabbit hole to explore.

## Looking Forward

Features that may be useful to add to the API:

- Move to aws lambda + gateway
- Data Visualization for the cryto nerds out there.
- Browser Extension - shuffle words on the go.
- Internationalization. Are anagrams a concept that exists in all languages? Find a linguist to chime in.
- More security on the DB, experiment with vanilla pg instead of using Knex.js
- Try [benchmark-bigo](https://github.com/davy/benchmark-bigo) for performance testing on your implementation
- Test and production tooling like [PM2](http://pm2.keymetrics.io/docs/usage/quick-start/). I've heard good things, but havent had to use them. It would be interesting to compare a different data storage method to PSQL