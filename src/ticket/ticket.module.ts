import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { PrismaModule } from "../prisma/prisma.module";
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';

@Module({
  imports:[PrismaModule],
  controllers: [TicketController],
  providers: [TicketService,JwtStrategy],
})
export class TicketModule {}
