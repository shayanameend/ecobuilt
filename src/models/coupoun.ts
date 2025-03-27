import mongoose from "mongoose";

const coupounSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your coupoun name!"],
    unique: true,
  },
  value: {
    type: Number,
    required: true,
  },
  minAmount: {
    type: Number,
  },
  maxAmount: {
    type: Number,
  },
  shopId: {
    type: String,
    required: true,
  },
  selectedProduct: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export const CoupounModel = mongoose.model("Coupoun", coupounSchema);
