import mongoose from 'mongoose';

// An interface that describes the properties
// that are required to create a new Payment
interface PaymentAttrs {
    orderId: string;
    chargeId: string;
}

// An interface that describes the properties
// that a Payment Model has
interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attrs: PaymentAttrs): PaymentDoc;
}

// An interface that describes the properties
// that a Payment Document has
interface PaymentDoc extends mongoose.Document {
    orderId: string;
    chargeId: string;
}

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    chargeId: {
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

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new Payment({
        orderId: attrs.orderId,
        chargeId: attrs.chargeId
    });
}

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export {Payment}
