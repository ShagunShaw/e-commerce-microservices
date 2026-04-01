import { IsOptional, IsString } from "class-validator";

export class UploadProductImageDto {
    @IsString()
    fileName: string;

    @IsString()
    mimeType: string;

    @IsString()
    base64: string;

    @IsString()
    uploadByUserId: string;
}


export class AttactToProductDto {
    @IsString()
    mediaId: string;

    @IsString()
    productId: string;

    @IsOptional()       // This should be before our @IsString() decorator
    @IsString()
    attachedByUserId?: string;
}