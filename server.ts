import express from "express";
import * as bodyParser from "body-parser";
import * as dotenv from 'dotenv';
import * as mongoose from "mongoose";

import {surveysRouter} from "./src/endpoints/surveys";
import {usersRouter} from './src/endpoints/users';
import {appliesRouter} from "./src/endpoints/applies";

dotenv.config();

const port = process.env.APPLICATION_PORT;

export const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/surveys', surveysRouter);
app.use('/users', usersRouter);
app.use('/applies', appliesRouter);

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT;
mongoose.connect(`mongodb://${mongoHost}:${mongoPort}/`)
    .catch(err => {throw err});

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => { console.log(`Server is running on ${port}`) });
}