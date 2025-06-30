import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

export class Book extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    author: string;

    @Prop({ required: true })
    price: number;

    @Prop()
    description: string;

}

export const BookSchema = SchemaFactory.createForClass(Book);
