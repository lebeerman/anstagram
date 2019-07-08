const fs = require('fs');
const readline = require('readline');

// Create a stream for the dictionary file
const readLineStream = readline.createInterface({
  input: fs.createReadStream(`${__dirname}/dictionary.txt`),
  console: false,
});

// capture data from the file as it's read
let lineNum = 0;
const corpus = [];

// event is emitted after each line - capture the line data
readLineStream.on('line', function(line) {
  lineNum++;
  // package each word and create an object for the DB row
  corpus.push({
    letters_id: line
      .split('')
      .sort()
      .join(''),
    lower_letters_id: line
      .toLowerCase()
      .split('')
      .sort()
      .join(''),
    word: line,
  });
});

// Manually ensure the data stream is closed at the end of the file
readLineStream.on('close', function(line) {
  console.log(`Seeding database with ${lineNum} words...`);
  console.log({ corpus });
});

// Make the corpus availble when called for
module.exports = corpus;
