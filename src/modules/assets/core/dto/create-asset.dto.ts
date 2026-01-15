import { IsNotEmpty, IsString, IsUUID, IsOptional } from "class-validator";

export class CreateAssetDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  assetCode: string;

  @IsNotEmpty()
  @IsUUID()
  assetGroupId: string;

  @IsNotEmpty()
  @IsUUID()
  assetTypeId: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsUUID()
  companyId: string;

  @IsNotEmpty()
  @IsUUID()
  officeId: string;

  @IsOptional()
  @IsUUID()
  roomId?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;
  
  @IsNotEmpty()
  @IsUUID()
  createdById: string;

  @IsNotEmpty()
  @IsUUID()
  updatedById: string;

}