import mongoose, { SchemaTypes } from "mongoose";

const messageSchema = new mongoose.Schema({
  conversation: {
    type: SchemaTypes.ObjectId,
    ref: "Conversation",
    required: true,
  },
  sender: {
    type: SchemaTypes.ObjectId,
    required: true,
  },
  text: {
    type: SchemaTypes.String,
    required: true,
  },
  image: {
    public_id: {
      type: SchemaTypes.String,
      required: true,
    },
    url: {
      type: SchemaTypes.String,
      required: true,
    },
  },
  createdAt: {
    type: SchemaTypes.Date,
    default: Date.now,
  },
  updatedAt: {
    type: SchemaTypes.Date,
    default: Date.now,
  },
});

export const MessageModel = mongoose.model("Message", messageSchema);
