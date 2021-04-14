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
it('returns unauthorized if user is not authorised', async () => {
    const orderId = mongoose.Types.ObjectId();
    const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .send()
        .expect(401);
});
it('returns not found if user provide an unknows orderId', async () => {
    const orderId = mongoose.Types.ObjectId();
    const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Cookie', global.getAuthCookie())
        .send()
        .expect(404);
});

it('returns unauthorized if user who try to get order details does not own the order', async () => {
    const ticket1 = await createTicket();

    const cookieUser1 = global.getAuthCookie('userId1');

    const responseOrder = await request(app)
        .post('/api/orders')
        .set('Cookie', cookieUser1)
        .send({
            ticketId: ticket1._id
        }).expect(201);
    await request(app)
        .get(`/api/orders/${responseOrder.body.id}`)
        .set('Cookie', global.getAuthCookie())
        .send()
        .expect(401);
})

it('returns unauthorized if user who try to get order details does not own the order', async () => {
    const ticket1 = await createTicket();

    const cookieUser1 = global.getAuthCookie('userId1');

    const responseOrder = await request(app)
        .post('/api/orders')
        .set('Cookie', cookieUser1)
        .send({
            ticketId: ticket1._id
        }).expect(201);
    await request(app)
        .get(`/api/orders/${responseOrder.body.id}`)
        .set('Cookie', cookieUser1)
        .send()
        .expect(200);
})
