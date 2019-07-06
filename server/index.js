const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

const app = (module.exports = express());
const port = parseInt(process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan(process.env.NODE_ENV !== 'production' ? 'dev' : 'combined'));
app.use(cors({ origin: true, credentials: true })); // TODO Limit origin if needed, not sure yet

// TODO: Static file handler - index.html or a react app
// app.use('/', express.static('./build'))

// Middleware Routes/Queries
app.use('/', require('./routes/router'));

// Catch all the errors and missed cases
app.use(notFound);
app.use(errorHandler);

function notFound(req, res, next) {
  res
    .status(404)
    .send({ error: 'Not found!', status: 404, url: req.originalUrl });
}

// eslint-disable-next-line
function errorHandler(err, req, res, next) {
  console.error('ERROR', err);
  const stack = process.env.NODE_ENV !== 'production' ? err.stack : undefined;
  res.status(500).send({ error: err.message, stack, url: req.originalUrl });
}

// Entry point
app
  .listen(port)
  .on('error', console.error.bind(console))
  .on(
    'listening',
    console.log.bind(console, `Listening on http://0.0.0.0:${port}`)
  );
