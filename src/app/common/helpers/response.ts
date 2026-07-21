import { ApiProperty } from '@nestjs/swagger';

export class APIResponse<T = any> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  expired: boolean;

  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string | string[];

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  path: string;

  @ApiProperty({ required: false })
  data?: T;
}
