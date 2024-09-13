import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketModule } from './ticket/ticket.module';
import { PrismaModule } from "./prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt"
import { AuthModule } from './auth/module/auth.module';
import { JwtStrategy } from './auth/strategy';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'secret',
      signOptions: { expiresIn: '1d' },
    }),
    TicketModule, PrismaModule,AuthModule],
  controllers: [AppController],
  providers: [AppService,AuthModule],
})
export class AppModule { }
