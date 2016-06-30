'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const knex = require('../knex');

router.post('/users', (req, res, next) => {
  const newUser = req.body;

  if (!newUser.first_name || newUser.first_name.trim() === '') {
    return res
      .status(400)
      .set('Content-Type', 'text/plain')
      .send('First name must not be blank');
  }

  if (!newUser.last_name || newUser.last_name.trim() === '') {
    return res
      .status(400)
      .set('Content-Type', 'text/plain')
      .send('Last name must not be blank');
  }

  if (!newUser.email || newUser.email.trim() === '') {
    return res
      .status(400)
      .set('Content-Type', 'text/plain')
      .send('Email must not be blank');
  }

  if (!newUser.password || newUser.password.trim() === '') {
    return res
      .status(400)
      .set('Content-Type', 'text/plain')
      .send('Password must not be blank');
  }

  knex('users')
    .select(knex.raw('1=1'))
    .where('email', newUser.email)
    .first()
    .then((exists) => {
      if (exists) {
        return res
          .status(400)
          .set('Content-Type', 'text/plain')
          .send('Email already exists');
      }

      bcrypt.hash(newUser.password, 12, (hashErr, hashed_password) => {
        if (hashErr) {
          return next(hashErr);
        }

        knex('users')
          .insert({
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            hashed_password
          }, '*')
          .then((users) => {
            res.sendStatus(200);
          })
          .catch((err) => {
            next(err);
          });
      });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
