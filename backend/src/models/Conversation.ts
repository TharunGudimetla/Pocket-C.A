import { Schema, model, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  title: string;
  pinned: boolean;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'New chat',
      maxlength: 120,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Conversation = model<IConversation>('Conversation', conversationSchema);
