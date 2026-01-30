import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFloorplanFields1738152000000 implements MigrationInterface {
    name = 'AddFloorplanFields1738152000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add floorplan columns to office table
        await queryRunner.query(`
            ALTER TABLE "office" 
            ADD COLUMN "floorplan_viewbox" varchar(100),
            ADD COLUMN "floorplan_outline_svg" text
        `);

        // Add SVG floorplan columns to room table
        await queryRunner.query(`
            ALTER TABLE "room" 
            ADD COLUMN "svg_path" text,
            ADD COLUMN "svg_fill_color" varchar(50) DEFAULT '#e0e0e0',
            ADD COLUMN "svg_label_x" float,
            ADD COLUMN "svg_label_y" float
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove floorplan columns from office table
        await queryRunner.query(`
            ALTER TABLE "office" 
            DROP COLUMN "floorplan_viewbox",
            DROP COLUMN "floorplan_outline_svg"
        `);

        // Remove SVG floorplan columns from room table
        await queryRunner.query(`
            ALTER TABLE "room" 
            DROP COLUMN "svg_path",
            DROP COLUMN "svg_fill_color",
            DROP COLUMN "svg_label_x",
            DROP COLUMN "svg_label_y"
        `);
    }
}
