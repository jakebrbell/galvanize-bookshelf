'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');

router.get('/authors', (_req, res, next) => {
  knex('authors')
    .orderBy('id')
    .then((authors) => {
      res.send(authors);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/authors/:id', (req, res, next) => {
  const id = Number.parseInt(req.params.id);

  if (Number.isNaN(id)) {
    return next();
  }

  knex('authors')
    .where('id', id)
    .first()
    .then((author) => {
      if (!author) {
        return next();
      }

      res.send(author);
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/authors', (req, res, next) => {
  knex('authors')
    .insert(req.body, '*')
    .then((authors) => {
      res.send(authors[0]);
    })
    .catch((err) => {
      next(err);
    });
});

router.patch('/authors/:id', (req, res, next) => {
  const id = Number.parseInt(req.params.id);

  if (Number.isNaN(id)) {
    return next();
  }

  // const authorChanges = req.body;
  //
  // if (authorChanges.portrait_url) {
  //   author.portrait_url = authorChanges.portrait_url;
  // }

  knex('authors')
    .update(req.body, '*')
    .where('id', id)
    .then((authors) => {
      res.send(authors[0]);
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/authors/:id', (req, res, next) => {
  const id = Number.parseInt(req.params.id);

  if (Number.isNaN(id)) {
    return next();
  }

  knex('authors')
    .where('id', id)
    .first()
    .then((author) => {
      if (!author) {
        return next();
      }

      return knex('authors')
        .del()
        .where('id', id)
        .then(() => {
          delete author.id;
          res.send(author);
        });
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/authors/:id/books', (req, res, next) => {
  const id = Number.parseInt(req.params.id);

  if (Number.isNaN(id)) {
    return next();
  }

  knex('books')
    .where('author_id', id)
    .orderBy('id')
    .then((book) => {
      res.send(book);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
