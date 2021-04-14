import {natsWrapper} from "../../../nats-wrapper";
import {TicketUpdatedEvent} from "@lftickets/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../../models/ticket";
import {TicketUpdatedListener} from "../ticket-updated-listener";


const setup = async () => {
    // create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // create and save a ticket
    const attrs = {
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    }
    const ticket = Ticket.build(attrs);
    await ticket.save();
    // create a fake data event
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'new title',
        price: 300,
        userId: new mongoose.Types.ObjectId().toHexString()
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, ticket, data, msg};
}

it('find, updates and saves a tickets', async () => {
    const {listener, ticket, data, msg} = await setup();
    // write assertions to make sur a ticket was created
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
})

it('acks the message', async () => {

    const {listener, data, msg} = await setup();
    // write assertions to make sur a ticket was created
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})

it('does not call ack if the event has skipped version number', async () => {

    const {listener, data, msg} = await setup();
    // write assertions to make sur a ticket was created

    // set future version for data
    data.version = 10;

    try {
        await listener.onMessage(data, msg);
    } catch (err) {
    }

    expect(msg.ack).not.toHaveBeenCalled();
})


