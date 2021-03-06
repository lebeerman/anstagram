const router = (module.exports = require('express').Router());
const wordQueries = require('./wordQueries');

// ROUTES
// Post - add words to the store
router.post('/:words.:json', (req, res, next) => {
  wordQueries
    .addWords(req.body.words)
    .then(item => {
      res.status(201).json({
        message: `Successfully added ${item.rowCount}`,
      });
    })
    .catch(next);
});

// Get - anagrams of a word passed as JSON
router.get('/anagrams/:word.:json/', (req, res, next) => {
  wordQueries
    .getAnagrams(req, next)
    .then(item => {
      const resultsArray = item.reduce(
        (words, entry) => [...words, entry.word],
        []
      );
      console.log('RESULTS:', resultsArray);
      res.status(200).json({
        anagrams: resultsArray,
      });
    })
    .catch(next);
});

// Delete All Route - disabled in prod
router.delete('/words.:json', (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(405).json();
  }
  wordQueries
    .deleteAllWords()
    .then(res.status(204).json())
    .catch(next);
});

// Delete Single Route - disabled in prod
router.delete('/words/:word.:json', (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(405).json();
  }
  wordQueries
    .deleteWord(req)
    .then(res.status(204).json())
    .catch(next);
});

// STRETCH ROUTES
// count of words + min/max/median/average word length
router.get('/words/info', (req, res, next) => {
  wordQueries.getWordsInfo().then(info => {
    info.avg = parseFloat(info.avg).toFixed(2);
    info.min = info.min.length;
    info.max = info.max.length;
    return res.status(200).json({ info });
  });
});

// Most Anagram Endpoint
router.get('/anagrams/max', (req, res, next) => {
  wordQueries
    .getAnagramMax()
    .then(mostAnagrams => {
      mostAnagrams = mostAnagrams.reduce(
        (words, entry) => [...words, entry.word],
        []
      );
      res.status(200).json({
        mostAnagrams,
      });
    })
    .catch(next);
});

// Endpoint that takes a set of words and returns whether or not they are all anagrams of each other
router.post('/anagrams/verify/:words.:json', (req, res, next) => {
  if (wordQueries.verifyAnagrams(req)) {
    res.status(200).json({
      anagramStatus: true,
    });
  } else {
    res.status(200).json({
      anagramStatus: false,
    });
  }
});

// Endpoint to return all anagram groups of size >= *x*
router.get('/anagrams/groups', (req, res, next) => {
  wordQueries
    .getAnagramGroups(req)
    .then(mostAnagrams => {
      res.status(200).json({
        anagramGroups: mostAnagrams.rows,
      });
    })
    .catch(next);
});

// Endpoint to delete a word *and all of its anagrams*
router.delete('/anagrams/:word.:json/', (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(405).json();
  }
  wordQueries
    .deleteAnagrams(req)
    .then(count =>
      res.status(200).json({
        message: `Removed ${count} words`,
      })
    )
    .catch(next);
});
