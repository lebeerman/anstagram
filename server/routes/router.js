// const knex = require('../db/knex');
const router = (module.exports = require('express').Router());

// http://expressjs.com/en/guide/routing.html - source for more info on route handling

router.get('/', (req, res, next) => {
  res.status(200).send('<p>Hello from Express<p>');
});

// MVP ROUTES
// router.get('/words/:limit?', TODO);
// router.get('/anagrams/:word.:json/:limit?', TODO);
// router.post('/:words.:json', TODO);
// router.delete('/words.:json', TODO);
// router.delete('/words/:word.:json', TODO);

// STRETCH ROUTES
// count of words + min/max/median/average word length
// Param for proper nouns in the list of anagrams
// Most Anagram Endpoint
// Endpoint that takes a set of words and returns whether or not they are all anagrams of each other
// Endpoint to return all anagram groups of size >= *x*
// Endpoint to delete a word *and all of its anagrams*
