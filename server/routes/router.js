const knex = require('../db/databaseConnection');
const router = (module.exports = require('express').Router());

// http://expressjs.com/en/guide/routing.html - source for more info on route handling

router.get('/', (req, res, next) => {
  res.status(200).send('<p>Hello from Express<p>');
});

// MVP ROUTES
router.post('/:words.:json', addWords);
router.get('/anagrams/:word.:json/', getAnagrams);
router.delete('/words.:json', deleteAllWords);
router.delete('/words/:word.:json', deleteWord);

// STRETCH ROUTES
// count of words + min/max/median/average word length
router.get('/words/info', getWordsInfo);
// Most Anagram Endpoint
router.get('/anagrams/max/', getAnagramMax);
// Endpoint that takes a set of words and returns whether or not they are all anagrams of each other
router.post('/anagrams/verify/:words.:json', verifyAnagrams);
// Endpoint to return all anagram groups of size >= *x*
router.get('/anagrams/groups', getAnagramGroups);
// Endpoint to delete a word *and all of its anagrams*
router.delete('/anagrams/:word.:json/', deleteAnagrams);

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
  const { word } = req.params;
  const letters_id = getLettersId(word);
  const { limit, noun } = req.query;
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
  if (
    noun &&
    noun
      .toString()
      .trim()
      .toLowerCase() === 'false'
  ) {
    console.log('Include proper nouns:', noun);
    getAnagramsQuery = getAnagramsQuery.where(
      knex.raw(
        'NOT SUBSTRING(word FROM 1 FOR 1) != LOWER(SUBSTRING(word FROM 1 FOR 1))'
      )
    );
  }
  getAnagramsQuery
    .then(item => {
      if (!item) return res.status(404).send({ message: 'Item not found.' });
      const resultsArray = item.reduce((words, entry) => {
        if (entry.word !== word) words.push(entry.word);
        return words;
      }, []);
      res.status(200).json({ anagrams: resultsArray });
    })
    .catch(next);
}

// DELETE
function deleteAllWords(req, res, next) {
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
  knex('words')
    .select('*')
    .where({ word })
    .first()
    .delete()
    .then(count =>
      count >= 0
        ? res.status(204).json({ message: `Removed ${count}, No Content` })
        : res.status(204).json({ message: 'Nothing deleted!' })
    )
    .catch(next);
}

function getWordsInfo(req, res, next) {
  const info = {};
  knex('words')
    .count('*')
    .then(count => {
      if (count.rows[0]) {
        info.count = minResult.rows[0].word.length;
      } else {
        info.count = 'Not Found';
      }

      knex.schema
        .raw('SELECT word FROM words ORDER BY LENGTH(word) ASC LIMIT 1')
        .then(minResult => {
          if (minResult.rows[0]) {
            info.min = minResult.rows[0].word.length;
          } else {
            info.min = 'Not Found';
          }
          knex.schema
            .raw('SELECT word FROM words ORDER BY LENGTH(word) DESC LIMIT 1')
            .then(maxResult => {
              if (maxResult.rows[0]) {
                info.max = maxResult.rows[0].word.length;
              } else {
                info.max = 'Not Found';
              }

              knex.schema
                .raw(
                  'SELECT percentile_disc(0.5) WITHIN GROUP (ORDER BY LENGTH(words.word)) FROM words'
                )
                .then(medianResult => {
                  if (medianResult.rows[0]) {
                    info.median = medianResult.rows[0].percentile_disc;
                  } else {
                    info.median = 'Not Found';
                  }

                  knex.schema
                    .raw('SELECT AVG(LENGTH(word)) FROM words')
                    .then(avgResult => {
                      if (avgResult.rows[0]) {
                        info.avg = parseFloat(avgResult.rows[0].avg).toFixed(2);
                      } else {
                        info.avg = 'Not Found';
                      }
                      console.log('INFO: ', info);
                      res.status(204).json({ message: info });
                    });
                });
            });
        });
    })
    .catch(next);
}

function getAnagramMax(req, res, next) {
  knex
    .raw(
      `SELECT letters_id, COUNT(*) AS anagrams FROM words GROUP BY letters_id ORDER BY COUNT(*) DESC LIMIT 1`
    )
    .then(result => {
      knex('words')
        .select('*')
        .where({ letters_id: result.rows[0].letters_id })
        .then(mostAnagrams => {
          const mostAnagramsArray = mostAnagrams.reduce((words, entry) => {
            words.push(entry.word);
            return words;
          }, []);
          console.log(mostAnagramsArray);
          res.status(204).json({ mostAnagramsArray });
        });
    });
}

function getAnagramGroups(req, res, next) {
  let { limit = 1 } = req.query;
  limit = Math.abs(parseInt(limit, null));
  limit = limit > 9 ? 1 : limit;
  knex
    .raw(
      `SELECT letters_id, COUNT(*) AS anagrams FROM words GROUP BY letters_id ORDER BY COUNT(*) DESC LIMIT ${limit}`
    )
    .then(mostAnagrams => {
      console.log(mostAnagrams.rows);
      // const mostAnagramsArray = mostAnagrams.reduce((words, entry) => {
      //   words.push(entry.word);
      //   return words;
      // }, []);
      res.status(204).json({ groups: mostAnagrams.rows });
    });
}

function verifyAnagrams(req, res, next) {
  const { words } = req.body;

  const letters_id = getLettersId(words[0]);
  knex('words')
    .select('*')
    .where({
      letters_id,
    })
    .then(results => {
      let anagramStatus = true;
      const resultsArray = results.reduce(
        (array, entry) => [...array, entry.word],
        []
      );
      console.log('RESULTS:', resultsArray);
      words.forEach(item => {
        if (!resultsArray.includes(item)) anagramStatus = false;
      });
      console.log('VERIFY: ', anagramStatus);
      res.status(204).json({ anagramStatus });
    })
    .catch(next);
}

function deleteAnagrams(req, res, next) {
  const { word } = req.params;
  const letters_id = getLettersId(word);
  knex('words')
    .select('*')
    .where({
      letters_id,
    })
    .delete()
    .then(count =>
      count > 0
        ? res.status(204).json({ message: `Removed ${count}, No Content` })
        : res.status(204).json({ message: 'Nothing deleted!' })
    )
    .catch(next);
}
