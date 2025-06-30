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

export class BookStock {
    @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
    book: Types.ObjectId;

    @Prop({ required: true })
    stock: number;
}

export const BookStockSchema = SchemaFactory.createForClass(BookStock);
