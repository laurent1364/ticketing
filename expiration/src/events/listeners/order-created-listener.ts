import {Listener, OrderCreatedEvent, Subjects} from "@lftickets/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {expirationQueue} from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    // readonly is final in Java
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
    readonly queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log('Waiting millisec: ', delay)
        await expirationQueue.add(
            {orderId: data.orderId},
            {
                delay: delay
            });
        msg.ack();
    }

}

