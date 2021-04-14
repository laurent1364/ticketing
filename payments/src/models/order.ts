import mongoose from 'mongoose';
import {updateIfCurrentPlugin} from "mongoose-update-if-current";
import {OrderStatus} from "@lftickets/common";

// An interface that describes the properties
// that are required to create a new Order
interface OrderAttrs {
    id: string;
    status: OrderStatus;
    version: number;
    userId: string;
    price: number;
}

// An interface that describes the properties
// that a Order Model has
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;

    findByEvent(event: { id: string, version: number }): Promise<OrderDoc | null>
}

// An interface that describes the properties
// that a Order Document has
interface OrderDoc extends mongoose.Document {
    status: OrderStatus;
    version: number;
    userId: string;
    price: number;
}

const orderSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
    }
});

orderSchema.set('versionKey', 'version')
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        version: attrs.version,
        price: attrs.price,
        userId: attrs.userId,
        status: attrs.status
    });
}

orderSchema.statics.findByEvent = (event: { id: string, version: number }) => {
    return Order.findOne({
        _id: event.id,
        version: event.version - 1
    });
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export {Order}
