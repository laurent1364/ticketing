import 'express-async-errors';

import mongoose from 'mongoose';

import {app} from './app'

const start = async () => {
    console.log('Stating Auth ......');

    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be define');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be define');
    }
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log('Connected to mongoDB');
    } catch (err) {
        console.log(err);
    }

    app.listen(3000, () => {
        console.log('Auth Service listen on port 3000');
    })
};

start();
