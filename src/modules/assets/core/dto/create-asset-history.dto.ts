import { IsEnum, IsDateString, IsString, IsObject, IsOptional, IsUUID } from 'class-validator';
import { AssetHistoryAction } from '../entities/asset-history.entity';

export class CreateAssetHistoryDto {
    @IsEnum(AssetHistoryAction)
    action: AssetHistoryAction;

    @IsDateString()
    date: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsObject()
    payload: Record<string, any>;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsUUID()
    approvedBy: string;
}
