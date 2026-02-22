import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';

export class CreatePathDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  order_index!: number;

  @IsOptional()
  @IsUrl()
  image_url?: string;
}

export class UpdatePathDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order_index?: number;

  @IsOptional()
  @IsUrl()
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
