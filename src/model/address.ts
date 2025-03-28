import mongoose, { SchemaTypes } from "mongoose";

const addressSchema = new mongoose.Schema({
  country: {
    type: SchemaTypes.String,
    required: true,
  },
  city: {
    type: SchemaTypes.String,
    required: true,
  },
  address: {
    type: SchemaTypes.String,
    required: true,
  },
  zid: {
    type: SchemaTypes.String,
    required: true,
  },
  type: {
    type: SchemaTypes.String,
    enum: ["DEFAULT", "SECONDARY"],
    required: true,
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

export const AddressModel = mongoose.model("Address", addressSchema);
