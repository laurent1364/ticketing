import {OrderCreatedListener} from "../order-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import mongoose from "mongoose";
import {OrderCreatedEvent, OrderStatus} from "@lftickets/common";
import {Order} from "../../../models/order";
import {Message} from "node-nats-streaming";

const setup = async () => {
     // create an instance of the listener
     const listener = new OrderCreatedListener(natsWrapper.client);

     // create a fake data event
     const data: OrderCreatedEvent['data'] = {
         version: 0,
         userId: mongoose.Types.ObjectId().toHexString(),
         status: OrderStatus.Created,
         orderId: mongoose.Types.ObjectId().toHexString(),
         expiresAt: new Date().toISOString(),
         ticket: {
             id: mongoose.Types.ObjectId().toHexString(),
             price: 20
         }
     }

     // create a fake message object
     // @ts-ignore
     const msg: Message = {
         ack: jest.fn()
     }

     return {listener, data, msg};
}

it('replicates the order info', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.orderId);
    expect(order).toBeDefined();
    expect(order!.price).toEqual(data.ticket.price);


});

it('acks message', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();

});
