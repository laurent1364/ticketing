import 'express-async-errors';

import mongoose from 'mongoose';

import {app} from './app'
import {natsWrapper} from "./nats-wrapper";
import {TicketCreatedListener} from "./events/listeners/ticket-created-listener";
import {TicketUpdatedListener} from "./events/listeners/ticket-updated-listener";
import {ExpirationCompleteListener} from "./events/listeners/expiration-complete-listener";
import {PaymentCreatedListener} from "./events/listeners/payment-created-listener";

const start = async () => {

    console.log('Starting ...');
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be define');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be define');
    }
    if (!process.env.NAT_URL) {
        throw new Error('NAT_URL must be define');
    }
    if (!process.env.NAT_CLIENT_ID) {
        throw new Error('NAT_CLIENT_ID must be define');
    }
    if (!process.env.NAT_CLUSTER_ID) {
        throw new Error('NAT_CLUSTER_ID must be define');
    }
    try {
        await natsWrapper.connect(process.env.NAT_CLUSTER_ID, process.env.NAT_CLIENT_ID, process.env.NAT_URL);
        natsWrapper.client.on('close', ()=> {
            console.log('NATS connection closed');
            process.exit();
        });

        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        new TicketCreatedListener(natsWrapper.client).listen();
        new TicketUpdatedListener(natsWrapper.client).listen();
        new ExpirationCompleteListener(natsWrapper.client).listen();
        new PaymentCreatedListener(natsWrapper.client).listen();


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
        console.log('Orders Service listen on port 3000');
    })
};

start();
