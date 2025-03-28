import mongoose, { SchemaTypes } from "mongoose";

const transactionSchema = new mongoose.Schema({
  amount: {
    type: SchemaTypes.Number,
    required: true,
  },
  status: {
    type: SchemaTypes.String,
    enum: ["PENDING"],
    default: "PENDING",
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

export const TransactionModel = mongoose.model(
  "Transaction",
  transactionSchema
);
