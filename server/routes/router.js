const knex = require('../db/databaseConnection');
const router = (module.exports = require('express').Router());

// http://expressjs.com/en/guide/routing.html - source for more info on route handling

router.get('/', (req, res, next) => {
  res.status(200).send('<p>Hello from Express<p>');
});

// MVP ROUTES
router.post('/:words.:json', addWords);
router.get('/anagrams/:word.:json/:limit?', getAnagrams);
router.delete('/words.:json', deleteAllWords);
router.delete('/words/:word.:json', deleteWord);

// STRETCH ROUTES
// count of words + min/max/median/average word length
// Param for proper nouns in the list of anagrams
// Most Anagram Endpoint
// Endpoint that takes a set of words and returns whether or not they are all anagrams of each other
// Endpoint to return all anagram groups of size >= *x*
// Endpoint to delete a word *and all of its anagrams*

const getLettersId = word =>
  word
    .split('')
    .sort()
    .join('');

// CREATE
function addWords(req, res, next) {
  const newWords = req.body.words
    ? req.body.words.map(word => ({
        letters_id: getLettersId(word),
        word,
      }))
    : next();
  console.log({ newWords });
  knex('words')
    .insert(newWords)
    .then(item => {
      // TODO - Message client about DUPS console.log({ item });
      res.status(201).json({ data: newWords });
    })
    .catch(next);
}

// READ
function getAnagrams(req, res, next) {
  // console.log('QUERY: ', req.query);
  const { word } = req.params;
  // console.log('WORD: ', word);
  const letters_id = getLettersId(word);
  const { limit } = req.query;
  // Store the query
  let getAnagramsQuery = knex('words')
    .select('*')
    .whereNot({ word })
    .where({
      letters_id,
    });
  // Check for a valid 'limit' param, modify the query chain
  if (limit >= 0) {
    getAnagramsQuery = getAnagramsQuery.limit(limit);
  }
  getAnagramsQuery
    .then(item => {
      if (!item) return res.status(404).send({ message: 'Item not found.' });
      const resultsArray = item.reduce((words, entry) => {
        if (entry.word !== word) words.push(entry.word);
        return words;
      }, []);
      // console.log('DB RES: ', resultsArray);
      res.status(200).json({ anagrams: resultsArray });
    })
    .catch(next);
}

// DELETE
function deleteAllWords(req, res, next) {
  // console.log('TESTING DELETE WORDS');
  // On Multiple DELETE - should there be different handling? Best Practice?
  knex('words')
    .select('*')
    .delete()
    .then(count =>
      count >= 0
        ? res.status(204).json({ message: `Removed ${count}, No Content` })
        : res.status(204).json({ message: 'Nothing deleted!' })
    )
    .catch(next);
}

// DELETE - SINGLE WORD
function deleteWord(req, res, next) {
  const { word } = req.params;
  // console.log('TESTING DELETE SINGLE: ', word);
  knex('words')
    .select('*')
    .where({ word })
    .first()
    .delete()
    .then(count =>
      // console.log(count);
      count >= 0
        ? res.status(204).json({ message: `Removed ${count}, No Content` })
        : res.status(204).json({ message: 'Nothing deleted!' })
    )
    .catch(next);
}
