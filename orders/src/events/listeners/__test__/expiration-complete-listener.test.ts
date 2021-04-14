import {natsWrapper} from "../../../nats-wrapper";
import {ExpirationCompleteEvent, OrderStatus} from "@lftickets/common";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../../models/ticket";
import {ExpirationCompleteListener} from "../expiration-complete-listener";
import {Order} from "../../../models/order";
import mongoose from "mongoose";


const setup = async () => {
    // create an instance of the listener
    const listener = new ExpirationCompleteListener(natsWrapper.client);
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    })
    await ticket.save();
    const order = Order.build({
        version: 0,
        status: OrderStatus.Created,
        userId: 'azeazezaeaze',
        expiresAt: new Date(),
        ticket
    });
    await order.save();

    // create a fake data event
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, order, msg};
}

it('updates order status', async () => {
    const {listener, data, order, msg} = await setup();
    // write assertions to make sur a ticket was created
    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder).toBeDefined();
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('acks the message', async () => {

    const {listener, data, msg} = await setup();
    // write assertions to make sur a ticket was created
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})

it('emits order-cancelled event ', async () => {

    const {listener, data, msg} = await setup();
    // write assertions to make sur a ticket was created
    await listener.onMessage(data, msg);


    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(ticketUpdatedData.orderId).toEqual(data.orderId);
})
