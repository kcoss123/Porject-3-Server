const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const jobsRouter = require('./routes/jobs');
const listRouter = require('./routes/list');
const workordersRouter = require('./routes/workorders');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('trust proxy', 1);
app.enable('trust proxy');

app.use(
    cors({
        origin: [process.env.REACT_APP_URI] // <== URL of our future React app
    })
);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/jobs', jobsRouter);
app.use('/list', listRouter);
app.use('/workorders', workordersRouter);

mongoose
    .connect(process.env.MONGODB_URI)
    .then((x) => console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`))
    .catch((err) => console.error("Error connecting to mongo", err));

module.exports = app;
