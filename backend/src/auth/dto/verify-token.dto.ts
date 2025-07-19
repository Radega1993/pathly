import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyTokenDto {
    @ApiProperty({
        description: 'Token de Firebase ID',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1Njc4OTAiLCJ0eXAiOiJKV1QifQ...',
    })
    @IsString()
    @IsNotEmpty()
    token: string;
} 