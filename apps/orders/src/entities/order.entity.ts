import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        },
    },
    toObject: { virtuals: true },
})

export class Order {
    @Prop({ type: [{ book: Types.ObjectId, quantity: Number, _id: false }], ref: 'Book', required: true })
    orders: { book: Types.ObjectId, quantity: number }[];

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
