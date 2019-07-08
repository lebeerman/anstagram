const knex = require('../db/databaseConnection');

// Utility
const getLettersId = word =>
  word
    .split('')
    .sort()
    .join('');

const getQueryOption = query => {
  // TODO Think more proper edge/limit/query options - default values. offsets. options. etc
  let { limit = 10, noun = false, size = 1 } = query;
  limit = Math.abs(parseInt(limit, null));
  limit = limit > 100 ? 10 : limit;
  size = Math.abs(parseInt(size, null));
  size = size > 100 ? 10 : size;
  noun = noun === 'true';
  return {
    limit,
    noun,
    size,
  };
};

const wordsQueries = {
  // POST - Create new anagrams
  addWords(words, next) {
    const newWords = words
      ? words.map(word => ({
          letters_id: getLettersId(word),
          lower_letters_id: getLettersId(word.toLowerCase()),
          word,
        }))
      : next();
    return knex('words').insert(newWords);
  },

  // GET - list anagrams of a request
  getAnagrams(req) {
    const { word } = req.params;
    const letters_id = getLettersId(word);
    const { limit, noun } = getQueryOption(req.query);
    // Store the query
    let getAnagramsQuery = knex('words')
      .select('*')
      .whereNot({
        word,
      });
    // Cheack for the Proper Noun query param - build the query chain
    if (noun) {
      console.log('Include proper nouns:', noun);
      getAnagramsQuery = getAnagramsQuery.where('lower_letters_id', letters_id);
    } else {
      getAnagramsQuery = getAnagramsQuery.where({
        letters_id,
      });
    }
    // Check for a valid 'limit' param, modify the query chain
    if (limit >= 0) {
      console.log('Limit: ', limit);
      getAnagramsQuery = getAnagramsQuery.limit(limit);
    }
    return getAnagramsQuery;
  },

  // DELETE
  deleteAllWords() {
    // On Multiple DELETE - should there be different handling? Best Practice?
    return knex('words')
      .select('*')
      .delete();
  },

  // DELETE - Single words
  deleteWord(req) {
    const { word } = req.params;
    return knex('words')
      .where({
        word,
      })
      .first()
      .delete();
  },

  // GET - Info on words in DB: count/min/max/median/average
  // Possible to memoize or cache, migrate data> Persist this in 'Status' table?
  getWordsInfo(req) {
    return knex
      .raw(
        ` SELECT COUNT(*) FROM words ;
          SELECT word AS min FROM words ORDER BY LENGTH(word) ASC LIMIT 1 ;
            SELECT word AS max FROM words ORDER BY LENGTH(word) DESC LIMIT 1 ;
            SELECT percentile_disc(0.5) WITHIN GROUP (ORDER BY LENGTH(words.word)) AS median FROM words ;
            SELECT AVG(LENGTH(word)) FROM words ;`
      )
      .then(info =>
        info.reduce(
          (returnValues, row) => ({ ...row.rows[0], ...returnValues }),
          {}
        )
      );
  },

  // GET - Identifies the words with the most anagrams using PSQL GROUP BY
  // Another approach would be faster. Persist this in 'Status' table? Reports Table?
  getAnagramMax() {
    return knex
      .raw(
        `SELECT letters_id, COUNT(word) FROM words GROUP BY letters_id ORDER BY COUNT(word) DESC LIMIT 1`
      )
      .then(result =>
        knex('words')
          .select('*')
          .where({
            letters_id: result.rows[0].letters_id,
          })
      );
  },

  // GET - Anagram Group of a size >= X; x is size param
  getAnagramGroups(req) {
    const { size } = getQueryOption(req.query);
    return knex.raw(
      `SELECT * FROM (SELECT letters_id, COUNT(*) AS anagrams FROM words GROUP BY letters_id ORDER BY COUNT(*) DESC) AS words WHERE anagrams >= ${size}`
    );
  },

  // POST - Receives words and checks if they are anagrams of eachother
  verifyAnagrams(req, res, next) {
    const { words } = req.body;
    const letters_id = words[0] ? getLettersId(words[0]) : next();
    const isAnAnagram = array =>
      array.every(word => getLettersId(word) === letters_id);
    return isAnAnagram(words);
  },

  // DELETE - All words if they are anagram from the store
  deleteAnagrams(req, res, next) {
    const { word } = req.params;
    const letters_id = getLettersId(word);
    return knex('words')
      .where({
        letters_id,
      })
      .delete();
  },
};
module.exports = wordsQueries;
