import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';


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

export class User extends Document {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    name: string;

    @Prop({ enum: ['user', 'admin'], default: 'user' })
    role: string;

    @Prop({
        type: [
            {
                book: { type: Types.ObjectId, ref: 'Book',required: true },
                quantity: { type: Number, required: true, default: 1 },
            },
        ],
        default: [], _id: false, id: false, 
    })
    OwnBooks: { book: Types.ObjectId; quantity: number }[];

}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});