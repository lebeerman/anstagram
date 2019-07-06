const knex = require('../db/databaseConnection');
const router = (module.exports = require('express').Router());

// http://expressjs.com/en/guide/routing.html - source for more info on route handling

router.get('/', (req, res, next) => {
  res.status(200).send('<p>Hello from Express<p>');
});

// MVP ROUTES
router.post('/:words.:json', addWords);
// router.get('/anagrams/:word.:json/:limit?', TODO);
// router.get('/words/:limit?', TODO);
router.delete('/words.:json', deleteAllWords);
// router.delete('/words/:word.:json', TODO);

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

function addWords(req, res, next) {
  // console.log('REQ Body: ', req.body);
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
      // console.log({ item });
      res.status(201).json({ data: newWords });
    })
    .catch(next);
}

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
