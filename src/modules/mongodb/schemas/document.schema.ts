import { Schema } from 'mongoose';

export const DocumentSchema = new Schema({
  versions: [{
    versionNumber: { type: Number, required: true },
    content: { type: Buffer, required: true }, // Binary content of the document
    mimeType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  }],
}); 