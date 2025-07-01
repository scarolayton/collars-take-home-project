import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class JwtPayload {
  @ApiProperty()
  sub: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;
}
