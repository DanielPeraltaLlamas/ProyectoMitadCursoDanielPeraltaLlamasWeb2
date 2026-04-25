import mongoose from "mongoose";
import { softDeletePlugin } from '../plugins/softDelete.plugin.js';

const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  number: { type: String, trim: true },
  postal: { type: String, trim: true },
  city: { type: String, trim: true },
  province: { type: String, trim: true }
}, { _id: false });

const clientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  name: { type: String, required: true, trim: true },
  cif: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  address: addressSchema,
  deleted: { type: Boolean, default: false }
}, { timestamps: true });

clientSchema.plugin(softDeletePlugin)

const Client = mongoose.model('Client', clientSchema);

export default Client

