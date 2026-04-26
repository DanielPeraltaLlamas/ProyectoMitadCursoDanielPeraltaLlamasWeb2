import mongoose from "mongoose";
import { softDeletePlugin } from '../plugins/softDelete.plugin.js';

const workerSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  hours: { type: Number }
}, { _id: false });

const deliveryNoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  format: { type: String, enum: ['material', 'hours'], required: true },
  description: { type: String, trim: true },
  workDate: { type: Date },
  material: { type: String, trim: true },
  quantity: { type: Number },
  unit: { type: String, trim: true },
  hours: { type: Number },
  workers: [workerSchema],
  signed: { type: Boolean, default: false },
  signedAt: { type: Date },
  signatureUrl: { type: String, trim: true },
  pdfUrl: { type: String, trim: true },

  deleted: { type: Boolean, default: false }
}, { timestamps: true });

deliveryNoteSchema.plugin(softDeletePlugin)

export default mongoose.model('DeliveryNote', deliveryNoteSchema);