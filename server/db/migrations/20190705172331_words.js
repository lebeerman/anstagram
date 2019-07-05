exports.up = function(knex) {
  return knex.schema.createTable('words', t => {
    t.increments('id');
    t.string('word');
    t.string('letters_id');
    t.unique('word');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('words');
};
