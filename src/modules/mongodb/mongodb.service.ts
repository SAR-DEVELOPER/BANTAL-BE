import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface MongoDocument {
  versions: Array<{
    versionNumber: number;
    content: Buffer;
    mimeType: string;
    uploadedAt: Date;
  }>;
}

@Injectable()
export class MongoDBService {
  constructor(
    @InjectModel('Document')
    private readonly documentModel: Model<MongoDocument>,
  ) {}

  async createDocument(content: Buffer, mimeType: string): Promise<string> {
    const document = new this.documentModel({
      versions: [{
        versionNumber: 1,
        content,
        mimeType,
        uploadedAt: new Date(),
      }],
    });

    const savedDoc = await document.save();
    return savedDoc._id.toString();
  }

  async addVersion(documentId: string, content: Buffer, mimeType: string): Promise<void> {
    const document = await this.documentModel.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const versionNumber = document.versions.length + 1;
    document.versions.push({
      versionNumber,
      content,
      mimeType,
      uploadedAt: new Date(),
    });

    await document.save();
  }

  async getLatestVersion(documentId: string): Promise<Buffer | null> {
    const document = await this.documentModel.findById(documentId);
    if (!document || document.versions.length === 0) {
      return null;
    }

    const latestVersion = document.versions[document.versions.length - 1];
    return latestVersion.content;
  }
} 