import {natsWrapper} from "./nats-wrapper";
import {OrderCreatedListener} from "./events/listeners/order-created-listener";

const start = async () => {
    console.log('Starting ....');
    if (!process.env.NAT_URL) {
        throw new Error('NAT_URL must be define');
    }
    if (!process.env.NAT_CLIENT_ID) {
        throw new Error('NAT_CLIENT_ID must be define');
    }
    if (!process.env.NAT_CLUSTER_ID) {
        throw new Error('NAT_CLUSTER_ID must be define');
    }
    if (!process.env.REDIS_HOST) {
        throw new Error('REDIS_HOST must be define');
    }
    try {
        await natsWrapper.connect(process.env.NAT_CLUSTER_ID, process.env.NAT_CLIENT_ID, process.env.NAT_URL);
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed');
            process.exit();
        });

        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen();

    } catch (err) {
        console.log(err);
    }
};

start();
