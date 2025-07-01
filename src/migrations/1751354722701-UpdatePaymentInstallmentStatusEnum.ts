import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePaymentInstallmentStatusEnum1751354722701 implements MigrationInterface {
    name = 'UpdatePaymentInstallmentStatusEnum1751354722701'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."payment_installment_status_enum" RENAME TO "payment_installment_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."payment_installment_status_enum" AS ENUM('pending', 'due', 'cleared', 'requested', 'paid', 'issue')`);
        await queryRunner.query(`ALTER TABLE "payment_installment" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payment_installment" ALTER COLUMN "status" TYPE "public"."payment_installment_status_enum" USING "status"::"text"::"public"."payment_installment_status_enum"`);
        await queryRunner.query(`ALTER TABLE "payment_installment" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."payment_installment_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payment_installment_status_enum_old" AS ENUM('pending', 'due', 'requested', 'paid')`);
        await queryRunner.query(`ALTER TABLE "payment_installment" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payment_installment" ALTER COLUMN "status" TYPE "public"."payment_installment_status_enum_old" USING "status"::"text"::"public"."payment_installment_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "payment_installment" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."payment_installment_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."payment_installment_status_enum_old" RENAME TO "payment_installment_status_enum"`);
    }

}
