exports.up = function(knex) {
  return knex.schema.createTable('words', t => {
    t.increments('id');
    t.string('word', 255);
    t.string('letters_id', 255);
    t.string('lower_letters_id', 255);
    t.unique('word');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('words');
};
