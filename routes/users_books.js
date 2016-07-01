'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');

const checkAuth = function(req, res, next) {
  if (!req.session.userId) {
    return res.sendStatus(401);
  }

  next();
};

router.get('/users/books', checkAuth, (req, res, next) => {
  knex('books')
    .innerJoin('users_books', 'users_books.book_id', 'books.id')
    .where('users_books.user_id', req.session.userId)
    .then((books) => {
      res.send(books);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/users/books/:bookId', checkAuth, (req, res, next) => {
  const bookId = Number.parseInt(req.params.bookId);

  knex('books')
    .innerJoin('users_books', 'users_books.book_id', 'books.id')
    .where({
      'books.id': bookId,
      'users_books.user_id': req.session.userId
    })
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
  const bookId = Number.parseInt(req.params.bookId);

  if (Number.isNaN(bookId)) {
    return next();
  }

  knex('books')
    .where('id', bookId)
    .first()
    .then((book) => {
      if(!book) {
        return next();
      }

      return knex('users_books')
        .insert({
          user_id: req.session.userId,
          book_id: bookId
        }, '*')
        .then((results) => {
          res.send(results[0]);
        });
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/users/books/:bookId', checkAuth, (req, res, next) => {
  const bookId = Number.parseInt(req.params.bookId);

  if (Number.isNaN(bookId)) {
    return next();
  }

  knex('users_books')
    .where({
      'user_id': req.session.userId,
      'book_id': bookId
    })
    .first()
    .then((user_book) => {
      if (!user_book) {
        return next();
      }

      return knex('users_books')
        .del()
        .where({
          'user_id': req.session.userId,
          'book_id': bookId
        })
        .then(() => {
          delete user_book.id;
          res.send(user_book);
        });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
