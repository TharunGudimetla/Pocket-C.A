import { Schema, model, Document, Types } from 'mongoose';
import { MessageRole } from '../types';

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Message = model<IMessage>('Message', messageSchema);
