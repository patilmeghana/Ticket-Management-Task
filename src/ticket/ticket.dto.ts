import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumberString, IsString, IsUUID, Length, Matches, MaxLength, MinLength, IsOptional, IsBoolean, IsEmail, IsIn, IsNumber, IsDateString, IsInt, IsArray, ValidateNested, IsObject, IsEnum } from 'class-validator';
//import { IsNotBlank } from 'src/helpers/decorator/IsNotBlankDeco';

// DTO class representing the request payload for OTP generation
class RegisterDto {
  @ApiProperty()
  @IsString()
  @Matches(/^[a-zA-Z0-9.' ]+$/i, { message: 'Invalid UserName given' })
  name: string;

  @ApiProperty()
  @IsString()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/(?=.*[@$!%*?&])/, { message: 'Password must contain at least one special character' })
  password: string;

  @ApiProperty()
  @IsString()
  @IsIn(['admin', 'customer'], { message: 'Role must be either "admin" or "customer"' })
  type: string;
}

class LoginDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

class CreateTicketDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsIn(['concert', 'conference', 'sports']) // Add other types as needed
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  venue: string;

  @ApiProperty()
  @IsString()
  @IsIn(['open', 'in-progress', 'closed'])
  status: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsString()
  @IsIn(['low', 'medium', 'high'])
  priority: string;

  @ApiProperty()
  @IsDateString()
  dueDate: string;

  @ApiProperty()
  @IsUUID()
  createdBy: string;
}

class AssignUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;
}

class AssignedUserDto {
  @IsString()
  userId: string;

  @IsString()
  name: string;

  @IsString()
  email: string;
}

class StatisticsDto {
  @IsInt()
  totalAssigned: number;

  @IsString()
  status: string;
}

class TicketDetailsDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  type: string;

  @IsString()
  venue: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsInt()
  price?: number;

  @IsString()
  priority: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsString()
  createdBy: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignedUserDto)
  assignedUsers: AssignedUserDto[];

  @ValidateNested()
  @Type(() => StatisticsDto)
  statistics: StatisticsDto;
}

class GetTicketsAnalyticsDto {
  @ApiProperty({
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    required: false
  })
  @IsOptional()
  @IsString()
  @IsEnum(['open', 'closed', 'in-progress']) // Enum values should match your status values
  status?: string;

  @ApiProperty({
    required: false
  })
  @IsOptional()
  @IsString()
  @IsEnum(['low', 'medium', 'high']) // Enum values should match your priority values
  priority?: string;

  @ApiProperty({
    required: false
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    required: false
  })
  @IsOptional()
  @IsString()
  venue?: string;
}

class TicketAnalyticsDto {
  @ApiProperty({
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;


  @ApiProperty({
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;


  @ApiProperty({
    required: false
  })
  @IsOptional()
  @IsString()
  status?: string;


  @ApiProperty({
    required: false
  })
  @IsOptional()
  @IsString()
  priority?: string;


  @ApiProperty({
    required: false
  })
  @IsOptional()
  @IsString()
  type?: string;


  @ApiProperty({
    required: false
  })
  @IsOptional()
  @IsString()
  venue?: string;
}


export {
  RegisterDto, LoginDto, CreateTicketDto, AssignUserDto, TicketDetailsDto, GetTicketsAnalyticsDto,TicketAnalyticsDto
};