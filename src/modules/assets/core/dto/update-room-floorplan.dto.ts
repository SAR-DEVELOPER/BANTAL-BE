import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateRoomFloorplanDto {
  @IsOptional()
  @IsString({ message: 'SVG path must be a string' })
  svgPath?: string;

  @IsOptional()
  @IsString({ message: 'SVG fill color must be a string' })
  svgFillColor?: string;

  @IsOptional()
  @IsNumber({}, { message: 'SVG label X must be a number' })
  svgLabelX?: number;

  @IsOptional()
  @IsNumber({}, { message: 'SVG label Y must be a number' })
  svgLabelY?: number;
}
