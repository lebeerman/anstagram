const corpusData = require('../dictionary_data_generator');

// This seed will ingest the dictionary into the psql DB
exports.seed = function(knex) {
  return knex('words')
    .del() // Deletes ALL existing entries
    .then(() =>
      knex
        .raw(
          knex('words')
            .insert(corpusData)
            .toString()
        )
        .catch(err => console.log(err))
    );
};
