import express, {Request, Response} from 'express';
import {BadRequestError, NotFoundError, requireAuth, validateRequest} from "@lftickets/common";
import {body} from "express-validator";
import mongoose from "mongoose";
import {Ticket} from "../models/ticket";
import {Order, OrderStatus} from "../models/order";
import {OrderCreatedPublisher} from "../events/publishers/order-created-publisher";
import {natsWrapper} from "../nats-wrapper";


const router = express.Router();

// 15 min
const EXPIRATION_WINDOW_SECONDS = 30;

router.post('/api/orders',
    requireAuth,
    [
        body('ticketId')
            .not().isEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage('TicketId must be provided')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const {ticketId} = req.body;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new NotFoundError();
        }
        const isReserved = await ticket.isReserved();
        if (isReserved) {
            throw new BadRequestError('Ticket is already reserved');
        }

        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket,
            version: 0
        });
        await order.save();

        await new OrderCreatedPublisher(natsWrapper.client).publish({
            orderId: order._id,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            version: order.version,
            ticket: {
                id: ticket.id,
                price: ticket.price
            }
        });
        res.status(201).send(order);
    });

export {router as createOrdersRouter};
