const router = (module.exports = require('express').Router());
const wordQueries = require('./wordQueries');
// http://expressjs.com/en/guide/routing.html - source for more info on route handling

router.get('/', (req, res, next) => {
  res.status(200).send('<p>Hello from Express<p>');
});

// MVP ROUTES
router.post('/:words.:json', wordQueries.addWords);
router.get('/anagrams/:word.:json/', wordQueries.getAnagrams);
router.delete('/words.:json', wordQueries.deleteAllWords);
router.delete('/words/:word.:json', wordQueries.deleteWord);

// STRETCH ROUTES
// count of words + min/max/median/average word length
router.get('/words/info', wordQueries.getWordsInfo);
// Most Anagram Endpoint
router.get('/anagrams/max/', wordQueries.getAnagramMax);
// Endpoint that takes a set of words and returns whether or not they are all anagrams of each other
router.post('/anagrams/verify/:words.:json', wordQueries.verifyAnagrams);
// Endpoint to return all anagram groups of size >= *x*
router.get('/anagrams/groups', wordQueries.getAnagramGroups);
// Endpoint to delete a word *and all of its anagrams*
router.delete('/anagrams/:word.:json/', wordQueries.deleteAnagrams);
