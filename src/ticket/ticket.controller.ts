
import {
  Body,
  Request,
  Controller,
  InternalServerErrorException,
  Logger,
  Post,
  HttpCode,
  BadRequestException,
  ConflictException,
  UseGuards,
  Param,
  Get,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TicketService } from './ticket.service';
import {
  AssignUserDto,
  CreateTicketDto,
  GetTicketsAnalyticsDto,
  LoginDto,
  RegisterDto
} from "./ticket.dto"
import { JwtGuard } from 'src/auth/guard';

@ApiTags("TicketManagement Module")
@Controller('ticket/api')
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  @Post("/users")
  @HttpCode(200)
  async register(@Body() registerDto: RegisterDto) {
    try {
      const user = await this.ticketService.createUser(registerDto);
      return user;
    } catch (error) {
      // If any error occurs, log the error and throw a generic internal server error
      // const a = {
      //   err: err.toString(),
      //   req: registerDto,
      // };
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw error;
      //  this.logger.error(JSON.stringify(a, null, " "));   
      // throw new InternalServerErrorException();
    }
  }


  @Post("/auth/login")
  @HttpCode(200)
  async userLogin(@Body() loginDto: LoginDto) {
    try {
      const userLogin = await this.ticketService.login(loginDto);
      return userLogin;
    } catch (error) {
      // if (error instanceof ConflictException) {
      //   throw new ConflictException(error.message);
      // }
      throw error;
      // throw new InternalServerErrorException();
    }
  }

  @ApiBearerAuth()
  @UseGuards(new JwtGuard())
  @Post("/ticket")
  @HttpCode(200)
  async create(@Request() req, @Body() createTicketDto: CreateTicketDto) {
    try {
      console.log("CONTROLLER????????????????")
      const ticket = await this.ticketService.createTicket(createTicketDto, req.user.sub);
      return ticket;
    } catch (error) {
      console.log(error)
      throw error
    }
  }


  @ApiBearerAuth()
  @UseGuards(new JwtGuard())
  @Post('/tickets/:ticketId/assign')
  async assignUser(@Param('ticketId') ticketId: string, @Body() assignUserDto: AssignUserDto, @Request() req) {
    try {
      console.log(" assign user in controller")
      const assignUser = this.ticketService.assignUser(ticketId, assignUserDto, req.user.sub);
      return assignUser;
    } catch (error) {
      throw error;
    }
  }

  @ApiBearerAuth()
  @UseGuards(new JwtGuard()) // Ensure user is authenticated
  @Get('analytics')
  async getTicketAnaly( @Query() query: GetTicketsAnalyticsDto,@Request() req) {
    try {
      console.log('inside ticket analytiics controller')
      const ticketAnalytics = await this.ticketService.getTicketAnalytics(query);
      return ticketAnalytics;
    } catch (error) {
      throw error;
    }
  }

  @ApiBearerAuth()
  @UseGuards(new JwtGuard()) // Ensure user is authenticated
  @Get(':ticketId')
  async getTicketDetails(@Param('ticketId') ticketId: string, @Request() req) {
    try {
      const ticketDetails = await this.ticketService.getTicketDetails(ticketId);
      return ticketDetails;
    } catch (error) {
      throw error;
    }
  }


}
