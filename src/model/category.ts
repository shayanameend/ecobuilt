import mongoose, { SchemaTypes } from "mongoose";

const messageSchema = new mongoose.Schema({
  images: [
    {
      public_id: {
        type: SchemaTypes.String,
        required: true,
      },
      url: {
        type: SchemaTypes.String,
        required: true,
      },
    },
  ],
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
