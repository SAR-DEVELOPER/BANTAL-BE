import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';

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

  async getMicrosoftUsers() {
    const client_id = process.env.MS_CLIENT_ID;
    const client_secret = process.env.MS_CLIENT_SECRET;
    const tenant_id = process.env.MS_TENANT_ID;
    const tokenUrl = `https://login.microsoftonline.com/${tenant_id}/oauth2/v2.0/token`;
    const tokenBody = new URLSearchParams();
    tokenBody.append('client_id', client_id || '');
    tokenBody.append('scope', 'https://graph.microsoft.com/.default');
    tokenBody.append('client_secret', client_secret || '');
    tokenBody.append('grant_type', 'client_credentials');

    // Get access token
    const tokenResp = await axios.post(tokenUrl, tokenBody, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const access_token = tokenResp.data.access_token;

    // Call Microsoft Graph users API
    const usersResp = await axios.get("https://graph.microsoft.com/v1.0/users?$top=150&$filter=userType eq 'Member'", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    return usersResp.data;
  }
} 