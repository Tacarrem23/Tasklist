import express from "express";
const app = express();
export default app;

app.use((err, req, res, next) => {
  switch (err.code) {
    // Invalid type
    case "22P02":
      return res.status(400).send(err.message);
    // Unique constraint violation
    case "23505":
    // Foreign key violation
    case "23503":
      return res.status(400).send(err.detail);
    default:
      next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Sorry! Something went wrong.");
});

require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

app.use('/users', require('./routes/users'));
app.use('/tasks', require('./routes/tasks'));

module.exports = app;
