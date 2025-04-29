import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

interface MongoDocument {
  versions: Array<{
    versionNumber: number;
    content: Buffer;
    mimeType: string;
    uploadedAt: Date;
  }>;
}

@Injectable()
export class DevService {
  constructor(
    @InjectModel('Document')
    private readonly documentModel: Model<MongoDocument>,
  ) {}

  async createTestDocument() {
    // Create a simple test buffer
    const testBuffer = Buffer.from('This is a test document content');

    const testDoc = new this.documentModel({
      versions: [{
        versionNumber: 1,
        content: testBuffer,
        mimeType: 'text/plain',
        uploadedAt: new Date(),
      }],
    });

    const savedDoc = await testDoc.save();
    return {
      id: savedDoc._id,
      versions: savedDoc.versions,
    };
  }
} 