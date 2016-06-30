'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');

const checkAuth = function(req, res, next) {
  if (!req.session.user) {
    return res.sendStatus(401);
  }

  next();
};

router.get('/users/books', checkAuth, (req, res, next) => {
  const userId = req.session.user.id;

  knex('books')
    .innerJoin('users_books', 'users_books.book_id', 'books.id')
    .where('users_books.user_id', userId)
    .then((books) => {
      res.send(books);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/users/books/:bookId', checkAuth, (req, res, next) => {
  const userId = req.session.user.id;
  const bookId = req.params.bookId;

  knex('books')
    .innerJoin('users_books', 'users_books.book_id', 'books.id')
    .where('books.id', bookId)
    .first()
    .then((book) => {
      if (!book) {
        return next();
      }

      res.send(book);
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/users/books/:bookId', checkAuth, (req, res, next) => {
  const userId = req.session.user.id;
  const bookId = Number.parseInt(req.params.bookId);

  knex('users_books')
    .insert({
      user_id: userId,
      book_id: bookId
    }, '*')
    .then((results) => {
      res.send(results[0]);
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/users/books/:bookId', checkAuth, (req, res, next) => {
  const userId = req.session.user.id;
  const bookId = Number.parseInt(req.params.bookId);

  knex('users_books')
    .where({
      'user_id': userId,
      'book_id': bookId
    })
    .first()
    .then((book) => {
      if (!book) {
        return next();
      }

      return knex('users_books')
        .del()
        .where({
          'user_id': userId,
          'book_id': bookId
        })
        .then(() => {
          delete book.id;
          res.send(book);
        });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
