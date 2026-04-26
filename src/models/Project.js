import mongoose from "mongoose";
import { softDeletePlugin } from '../plugins/softDelete.plugin.js';

const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  number: { type: String, trim: true },
  postal: { type: String, trim: true },
  city: { type: String, trim: true },
  province: { type: String, trim: true }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  name: { type: String, required: true, trim: true },
  projectCode: { type: String, trim: true },
  address: addressSchema,
  email: { type: String, trim: true, lowercase: true },
  notes: { type: String, trim: true },
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false }
}, { timestamps: true });

projectSchema.plugin(softDeletePlugin)

const Project = mongoose.model('Project', projectSchema);

export default Project