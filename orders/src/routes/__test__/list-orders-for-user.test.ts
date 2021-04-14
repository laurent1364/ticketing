import request from 'supertest';
import {app} from "../../app";
import {Ticket, TicketDoc} from "../../models/ticket";
import mongoose from "mongoose";
import {Order, OrderStatus} from "../../models/order";

const createTicket = async () => {
    const ticket = Ticket.build({
        title: 'ticket title',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString()
    });
    return await ticket.save();
}

const createOrder = async (ticket: TicketDoc, userId?: string) => {
    const order = Order.build({
        ticket,
        userId: userId ? userId : 'dfkhsdfkjh',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        version: 0
    });
    return order.save();
}
it('has a route handle listening to /api/orders for a GET requests', async () => {
    const response = await request(app)
        .get('/api/orders')
        .send({});

    expect(response.status).not.toEqual(404);
});

it('returns unauthorized if user is not authorised', async ()=> {
    const response = await request(app)
        .get('/api/orders')
        .send();

    expect(response.status).toEqual(401);
})

it('fetch orders for a particular user', async () => {
    const ticket1 = await createTicket();
    const ticket2 = await createTicket();
    const ticket3 = await createTicket();

    const cookieUser1 = global.getAuthCookie('userId1');
    const cookieUser2 =  global.getAuthCookie('userId2');

    await request(app)
        .post('/api/orders')
        .set('Cookie', cookieUser1)
        .send({
            ticketId: ticket1._id
        }).expect(201);
    await request(app)
        .post('/api/orders')
        .set('Cookie', cookieUser2)
        .send({
            ticketId: ticket2._id
        }).expect(201);
    await request(app)
        .post('/api/orders')
        .set('Cookie', cookieUser2)
        .send({
            ticketId: ticket3._id
        }).expect(201);

   const response = await request(app)
        .get('/api/orders')
        .set('Cookie', cookieUser2)
        .send().expect(200);

   expect(response.body.length).toEqual(2);
})
