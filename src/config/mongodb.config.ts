export interface MongoDBConfig {
  uri: string;
  database: string;
  options?: {
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
    // Add other MongoDB options as needed
  };
}

export const defaultMongoDBConfig: MongoDBConfig = {
  // Using the same URI as defined in docker-compose.yaml
  uri: process.env.MONGODB_URI || 'mongodb://mongo:27017',
  // Using the same database name as defined in docker-compose.yaml
  database: process.env.MONGODB_DATABASE || 'bantal_db',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Add any additional options as needed
  },
}; 