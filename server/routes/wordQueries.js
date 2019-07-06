const knex = require('../db/databaseConnection');

// Utility
const getLettersId = word =>
  word
    .split('')
    .sort()
    .join('');

const getQueryOption = query => {
  // TODO Think about proper edge/limit/query options - default values. offsets. options. etc
  let { limit = 10, noun = true } = query;
  limit = Math.abs(parseInt(limit, null));
  limit = limit > 100 ? 10 : limit;
  noun =
    toString(noun)
      .trim()
      .toLowerCase() === true
      ? 'true'
      : 'false';
  return { limit, noun };
};

const wordsQueries = {
  // CREATE
  addWords(req, res, next) {
    const newWords = req.body.words
      ? req.body.words.map(word => ({
          letters_id: getLettersId(word),
          word,
        }))
      : next();
    knex('words')
      .insert(newWords)
      .then(item => {
        // TODO - Message client about DUPS - 422
        // console.info({ item });
        res.status(201).json({
          data: newWords,
        });
      })
      .catch(next);
  },

  getAnagrams(req, res, next) {
    // READ
    const { word } = req.params;
    const letters_id = getLettersId(word);
    const { limit, noun } = getQueryOption(req.query);
    // Store the query
    let getAnagramsQuery = knex('words')
      .select('*')
      .whereNot({
        word,
      })
      .where({
        letters_id,
      });
    // Check for a valid 'limit' param, modify the query chain
    if (limit >= 0) {
      console.log('Limit: ', limit);
      getAnagramsQuery = getAnagramsQuery.limit(limit);
    }
    if (noun === 'false') {
      console.log('Include proper nouns:', noun);
      getAnagramsQuery = getAnagramsQuery.where(
        knex.raw(
          'NOT SUBSTRING(word FROM 1 FOR 1) != LOWER(SUBSTRING(word FROM 1 FOR 1))'
        )
      );
    }
    getAnagramsQuery
      .then(item => {
        if (!item)
          return res.status(404).send({
            message: 'Item not found.',
          });
        const resultsArray = item.reduce(
          (words, entry) =>
            entry.word !== word ? [...words, entry.word] : words,
          []
        );
        console.log('RESULTS:', resultsArray);
        res.status(200).json({
          anagrams: resultsArray,
        });
      })
      .catch(next);
  },

  // DELETE
  deleteAllWords(req, res, next) {
    // On Multiple DELETE - should there be different handling? Best Practice?
    knex('words')
      .select('*')
      .delete()
      .then(count =>
        count >= 0
          ? res.status(200).json({
              message: `Removed ${count}, No Content`,
            })
          : res.status(204).send({
              message: 'Nothing deleted!',
            })
      )
      .catch(next);
  },

  // DELETE - SINGLE WORD
  deleteWord(req, res, next) {
    const { word } = req.params;
    knex('words')
      .select('*')
      .where({
        word,
      })
      .first()
      .delete()
      .then(count =>
        count >= 0
          ? res.status(200).json({
              message: `Removed ${count}, No Content`,
            })
          : res.status(204).json({
              message: 'Nothing deleted!',
            })
      )
      .catch(next);
  },

  getWordsInfo(req, res, next) {
    const info = {};
    try {
      knex('words')
        .count('*')
        .then(count => {
          console.log('COUNT:', count[0]);
          if (count[0].count) {
            info.count = count[0].count;
          } else {
            info.count = 'Count Not Found';
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
                .raw(
                  'SELECT word FROM words ORDER BY LENGTH(word) DESC LIMIT 1'
                )
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
                            info.avg = parseFloat(
                              avgResult.rows[0].avg
                            ).toFixed(2);
                          } else {
                            info.avg = 'Not Found';
                          }
                          console.log('INFO: ', info);
                          res.status(200).json({ info });
                        })
                        .catch(next);
                    })
                    .catch(next);
                })
                .catch(next);
            })
            .catch(next);
        })
        .catch(next);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },

  getAnagramMax(req, res, next) {
    knex
      .raw(
        `SELECT letters_id, COUNT(word) FROM words GROUP BY letters_id ORDER BY COUNT(word) DESC LIMIT 1`
      )
      .then(result => {
        // console.log('getAnagramsMax:', result);
        if (result.rows.length > 0) {
          knex('words')
            .select('*')
            .where({
              letters_id: result.rows[0].letters_id,
            })
            .then(mostAnagrams => {
              mostAnagrams = mostAnagrams.reduce(
                (words, entry) => [...words, entry.word],
                []
              );
              console.log(mostAnagrams);
              res.status(200).json({
                mostAnagrams,
              });
            })
            .catch(next);
        } else {
          res.status(200).json({
            mostAnagramsArray: 'Not Found',
          });
        }
      })
      .catch(next);
  },

  getAnagramGroups(req, res, next) {
    const { limit } = getQueryOption(req.query);
    knex
      .raw(
        `SELECT letters_id, COUNT(*) AS anagrams FROM words GROUP BY letters_id ORDER BY COUNT(*) DESC LIMIT ${limit}`
      )
      .then(mostAnagrams => {
        console.log(mostAnagrams.rows);
        res.status(200).json({
          groups: mostAnagrams.rows,
        });
      })
      .catch(next);
  },

  // CHECK POST JSON IF THEY ARE VALID ANAGRAMS
  verifyAnagrams(req, res, next) {
    const { body } = req;
    console.log(body);
    const letters_id = body.words ? getLettersId(body.words[0]) : null;
    if (!letters_id) {
      next();
    }
    knex('words')
      .select('*')
      .where({
        letters_id,
      })
      .then(results => {
        console.log('verifyAnagrams:', results);
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
        res.status(200).json({
          anagramStatus,
        });
      })
      .catch(next);
  },

  // DELETE ALL WORDS BY ANAGRAM
  deleteAnagrams(req, res, next) {
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
          ? res.status(200).json({
              message: `Removed ${count}, No Content`,
            })
          : res.status(200).json({
              message: 'Nothing deleted!',
            })
      )
      .catch(next);
  },
};
module.exports = wordsQueries;
