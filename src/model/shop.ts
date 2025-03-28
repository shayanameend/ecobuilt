import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import mongoose, { SchemaTypes } from "mongoose";

import { env } from "@/lib/env";

const shopSchema = new mongoose.Schema({
  avatar: {
    public_id: {
      type: SchemaTypes.String,
      required: true,
    },
    url: {
      type: SchemaTypes.String,
      required: true,
    },
  },
  name: {
    type: SchemaTypes.String,
    required: true,
  },
  description: {
    type: SchemaTypes.String,
    required: true,
  },
  email: {
    type: SchemaTypes.String,
    unique: true,
    required: true,
  },
  password: {
    type: SchemaTypes.String,
    required: true,
    select: false,
  },
  phone: {
    type: SchemaTypes.String,
    required: true,
  },
  role: {
    type: SchemaTypes.String,
    enum: ["ADMIN"],
    default: "ADMIN",
  },
  balance: {
    type: SchemaTypes.Number,
    default: 0,
  },
  addresses: [
    {
      type: SchemaTypes.ObjectId,
      ref: "Address",
      required: true,
    },
  ],
  transactions: [
    {
      type: SchemaTypes.ObjectId,
      ref: "Transaction",
      required: true,
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

shopSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

shopSchema.methods.getJwtToken = function () {
  return jwt.sign(
    { _id: this._id },
    env.JWT_SECRET_KEY as string,
    {
      expiresIn: env.JWT_EXPIRES,
    } as SignOptions
  );
};

shopSchema.methods.compare = async function (pass: string) {
  return await bcrypt.compare(pass, this.password);
};

export const ShopModel = mongoose.model("Shop", shopSchema);
