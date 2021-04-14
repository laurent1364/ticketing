import {natsWrapper} from "../../../nats-wrapper";
import mongoose from "mongoose";
import {OrderCancelledEvent, OrderStatus} from "@lftickets/common";
import {Order} from "../../../models/order";
import {OrderCancelledListener} from "../order-cancelled-listener";
import {Message} from "node-nats-streaming";

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        version: 0,
        userId: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 20,
        id: mongoose.Types.ObjectId().toHexString()
    });

    await order.save();
    // create a fake data event
    const data: OrderCancelledEvent['data'] = {
        version: 1,
        orderId: order._id,
        ticketId: mongoose.Types.ObjectId().toHexString()
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, order, msg};
}

it('replicates the order info', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(data.orderId);
    expect(updatedOrder).toBeDefined();
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks message', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();

});
