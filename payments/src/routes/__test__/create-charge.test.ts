import request from 'supertest';
import {app} from "../../app";
import mongoose from "mongoose";
import {Order} from "../../models/order";
import {OrderStatus} from "@lftickets/common";
import {stripe} from "../../stripe";
import {Payment} from "../../models/payment";


const createOrder = async () => {
    const order = Order.build({
        price: Math.floor(Math.random() * 100000),
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        id: mongoose.Types.ObjectId().toHexString()
    });

    await order.save();

    return {order};
}

it('returns 404 when purchasing an order that does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.getAuthCookie())
        .send({
            token: 'dflkjsdflkdsjflkjsdf',
            orderId: mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
});

it('return 401 when purchasing an order that doesnt belong to the user', async () => {
    const {order} = await createOrder();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.getAuthCookie())
        .send({
            token: 'dflkjsdflkdsjflkjsdf',
            orderId: order._id
        })
        .expect(401);
});

it('returns 400 when purchasing a cancelled order', async () => {
    const {order} = await createOrder();
    order.set({status: OrderStatus.Cancelled});
    await order.save();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.getAuthCookie(order.userId, 'test@testing.com'))
        .send({
            token: 'dflkjsdflkdsjflkjsdf',
            orderId: order._id
        })
        .expect(400);
});

it('returns 201 with valid inputs', async () => {
    const {order} = await createOrder();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.getAuthCookie(order.userId, 'test@testing.com'))
        .send({
            token: 'tok_visa',
            orderId: order._id
        })
        .expect(201);

    const stripeResponse = await stripe.charges.list({limit: 50});
    const stripeCharge = stripeResponse.data.find(charge => {
        return charge.amount === order.price * 100
    });

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('usd')

});


it('returns 201 with valid inputs', async () => {
    const {order} = await createOrder();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.getAuthCookie(order.userId, 'test@testing.com'))
        .send({
            token: 'tok_visa',
            orderId: order._id
        })
        .expect(201);
    const payment = await Payment.findOne({orderId: order.id});

    expect(payment).toBeDefined();

});

