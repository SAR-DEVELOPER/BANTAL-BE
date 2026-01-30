import { IsString, IsOptional } from 'class-validator';

export class UpdateOfficeFloorplanDto {
  @IsOptional()
  @IsString({ message: 'Floorplan viewbox must be a string' })
  floorplanViewbox?: string;

  @IsOptional()
  @IsString({ message: 'Floorplan outline SVG must be a string' })
  floorplanOutlineSvg?: string;
}
