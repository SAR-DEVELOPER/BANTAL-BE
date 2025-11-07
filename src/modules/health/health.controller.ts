// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) { }

  @Get('db')
  async checkDatabaseConnection() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // Get database name
      const dbNameResult = await queryRunner.query(
        'SELECT current_database() as database_name',
      );
      const databaseName = dbNameResult[0]?.database_name;

      // Get all schemas
      const schemasResult = await queryRunner.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        ORDER BY schema_name
      `);
      const schemas = schemasResult.map((row: any) => row.schema_name);

      // Get all tables with their schemas
      const tablesResult = await queryRunner.query(`
        SELECT 
          table_schema,
          table_name,
          table_type
        FROM information_schema.tables
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        ORDER BY table_schema, table_name
      `);

      // Group tables by schema
      const tablesBySchema: Record<string, any[]> = {};
      tablesResult.forEach((row: any) => {
        if (!tablesBySchema[row.table_schema]) {
          tablesBySchema[row.table_schema] = [];
        }
        tablesBySchema[row.table_schema].push({
          name: row.table_name,
          type: row.table_type,
        });
      });

      // Get table counts
      const tableCounts: Record<string, number> = {};
      for (const schema of schemas) {
        const countResult = await queryRunner.query(
          `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = $1`,
          [schema],
        );
        tableCounts[schema] = parseInt(countResult[0]?.count || '0', 10);
      }

      await queryRunner.release();

      return {
        status: 'ok',
        db: 'connected',
        database: {
          name: databaseName,
          schemas: schemas,
          schemaCount: schemas.length,
          tablesBySchema: tablesBySchema,
          tableCounts: tableCounts,
          totalTables: Object.values(tableCounts).reduce(
            (sum, count) => sum + count,
            0,
          ),
        },
      };
    } catch (error) {
      return {
        status: 'error',
        db: 'disconnected',
        message: error.message,
      };
    }
  }
}
