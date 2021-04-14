import express, {Request, Response} from 'express';
import {NotFoundError, requireAuth, UnauthorizedError} from "@lftickets/common";
import {Order, OrderStatus} from "../models/order";
import {OrderCreatedPublisher} from "../events/publishers/order-created-publisher";
import {natsWrapper} from "../nats-wrapper";
import {OrderCancelledPublisher} from "../events/publishers/order-cancelled-publisher";


const router = express.Router();

router.delete('/api/orders/:orderId',
    requireAuth,
    async (req: Request, res: Response) => {
        const order = await Order.findById(req.params.orderId).populate('ticket');
        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new UnauthorizedError();
        }
        order.set({
            status: OrderStatus.Cancelled
        });
        await order.save();

        await new OrderCancelledPublisher(natsWrapper.client).publish({
            orderId: order.id,
            ticketId: order.ticket.id,
            version: order.version
        });
        res.status(202).send(order);

    });

export {router as cancelOrdersRouter};
