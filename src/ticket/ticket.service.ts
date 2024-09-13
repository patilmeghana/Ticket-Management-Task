import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AssignUserDto, CreateTicketDto, GetTicketsAnalyticsDto, LoginDto, RegisterDto, TicketDetailsDto } from './ticket.dto';
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TicketService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService
    ) { }

    async createUser(registerDto: RegisterDto) {
        const { email, type, password } = registerDto;
        // Check for unique email
        const existingUser = await this.prismaService.user.findUnique({ where: { email } });

        if (existingUser) {
            throw new ConflictException('Email is already in use');
        }

        // Check for role exclusivity
        // const existingAdmin = await this.prismaService.user.findFirst({ where: { type: 'admin' } });
        // console.log(existingAdmin)
        // if (type === 'admin' && existingAdmin) {
        //     throw new ConflictException('An admin already exists');
        // }
        // if (type === 'customer' && existingAdmin && existingAdmin.type === 'customer') {
        //     throw new ConflictException('A customer already exists');
        // }

        const saltOrRounds = 10;

        const hashedPassword = await bcrypt.hash(password, saltOrRounds)

        const info = {
            ...registerDto,
            password: hashedPassword
        };
        // Insert the data into the user table
        const user = await this.prismaService.user.create({ data: info });

        return {
            id: user.id,
            name: user.name,
            email: user.email,
        };
    }


    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;
        // Check for unique email
        const existingUser = await this.prismaService.user.findUnique({ where: { email } });

        if (!existingUser) {
            throw new BadRequestException('Invalid Credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: existingUser.email, sub: existingUser.id };
        console.log(payload)
        const jwt = this.jwtService.sign(payload);
        return { token: jwt };

    }

    async createTicket(CreateTicketDto: CreateTicketDto, userId: string) {
        try {
            const { title, description, type, venue, status, price, priority, dueDate, createdBy } = CreateTicketDto;

            // Check if the user exists
            const user = await this.prismaService.user.findUnique({ where: { id: createdBy } });
            console.log(user)
            if (!user) {
                throw new NotFoundException('User does not exist');
            }
            // Ensure the user creating the ticket is the same as createdBy
            if (createdBy !== userId) {
                throw new BadRequestException('CreatedBy must match the authenticated user');
            }

            // Validate dueDate
            const dueDateObj = new Date(dueDate);
            if (dueDateObj <= new Date()) {
                throw new BadRequestException('Due date must be a future date');
            }

            // Create the ticket
            const ticket = await this.prismaService.ticket.create({
                data: {
                    // userId,
                    title,
                    description,
                    type,
                    venue,
                    status,
                    price,
                    priority,
                    dueDate: dueDateObj,
                    createdBy,
                },
            });

            return {
                id: ticket.id,
                title: ticket.title,
                description: ticket.description,
                type: ticket.type,
                venue: ticket.venue,
                status: ticket.status,
                priority: ticket.priority,
                dueDate: ticket.dueDate.toISOString(),
                createdBy: ticket.createdBy,
                assignedUsers: [], // Initialize with an empty array
            };
        } catch (error) {
            throw error
        }
    }

    async assignUser(ticketId: string, dto: AssignUserDto, currentUserId: string) {
        console.log("ticketId///", ticketId)
        console.log(dto),
            console.log(currentUserId)
        try {
            console.log('ho assign iuser')
            const { userId } = dto;

            // Convert ticketId to an integer
            const ticketIdInt = parseInt(ticketId);
            console.log(ticketIdInt)

            if (isNaN(ticketIdInt)) {
                throw new BadRequestException('Invalid ticket ID');
            }

            // Check if ticket exists
            const ticket = await this.prismaService.ticket.findUnique({ where: { id: ticketIdInt } });
            if (!ticket) {
                throw new NotFoundException('Ticket not found');
            }

            // Check if ticket is closed
            if (ticket.status === 'closed') {
                throw new ForbiddenException('Cannot assign users to a closed ticket');
            }

            // Check if user exists
            const user = await this.prismaService.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new NotFoundException('User does not exist');
            }

            // Check if user is an admin
            if (user.type === 'admin') {
                throw new ForbiddenException('Cannot assign a ticket to an admin');
            }

            // Check if user is already assigned
            const existingAssignment = await this.prismaService.assign_ticket.findUnique({
                where: {
                    userId_ticketId: {
                        userId: userId,
                        ticketId: ticketIdInt,
                    },
                },
            });
            console.log("existingAssignment", existingAssignment)
            if (existingAssignment) {
                throw new ForbiddenException('User already assigned');
            }

            // // Check if assignment limit is reached
            const assignmentCount = await this.prismaService.assign_ticket.count({
                where: { ticketId: ticketIdInt },
            });
            console.log("assignmentCount//", assignmentCount)
            const MAX_ASSIGNMENTS = 5; // Define your limit here
            if (assignmentCount >= MAX_ASSIGNMENTS) {
                throw new ForbiddenException('User assignment limit reached');
            }

            // Check if current user is allowed to assign
            const isCreator = ticket.createdBy === currentUserId;
            console.log("isCreator//", isCreator);

            const isAdmin = (await this.prismaService.user.findUnique({ where: { id: currentUserId } }))?.type === 'admin';
            console.log("isAdmin", isAdmin)
            if (!isCreator && !isAdmin) {
                throw new UnauthorizedException('Only the creator or an admin can assign users');
            }

            // // Create assignment
            await this.prismaService.assign_ticket.create({
                data: {
                    userId: userId,
                    ticketId: ticketIdInt
                },
            });
            return { message: 'User assigned Successfully' }
        } catch (error) {
            throw error
        }
    }

    async getTicketDetails(ticketId: string) {
        // Convert ticketId to an integer
        const ticketIdInt = parseInt(ticketId);
        console.log("ticketIdInt//", ticketIdInt)
        if (isNaN(ticketIdInt)) {
            throw new NotFoundException('Invalid ticket ID');
        }

        // Fetch the ticket details
        const ticket = await this.prismaService.ticket.findUnique({
            where: { id: ticketIdInt },
            include: {
                assignments: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        console.log("ticket", ticket)

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }

        // Prepare assigned users
        const assignedUsers = ticket.assignments.map(assignment => ({
            userId: assignment.user.id,
            name: assignment.user.name,
            email: assignment.user.email,
        }));

        // Prepare statistics
        const totalAssigned = ticket.assignments.length;
        const statistics = {
            totalAssigned,
            status: ticket.status,
        };

        // Map ticket details to DTO
        const ticketDetails: TicketDetailsDto = {
            id: ticket.id.toString(),
            title: ticket.title || '',
            description: ticket.description || '',
            type: ticket.type || '',
            venue: ticket.venue || '',
            status: ticket.status || '',
            price: ticket.price || undefined,
            priority: ticket.priority || '',
            dueDate: ticket.dueDate ? ticket.dueDate.toISOString() : undefined,
            createdBy: ticket.createdBy || '',
            assignedUsers,
            statistics,
        };

        return ticketDetails;

    }


    async getTicketAnalytics(dto: GetTicketsAnalyticsDto) {
        const where: any = {};

        if (dto.startDate) {
            where.createdAt = { gte: new Date(dto.startDate) };
        }

        if (dto.endDate) {
            where.createdAt = { ...where.createdAt, lte: new Date(dto.endDate) };
        }

        if (dto.status) {
            where.status = dto.status;
        }

        if (dto.priority) {
            where.priority = dto.priority;
        }

        if (dto.type) {
            where.type = dto.type;
        }

        if (dto.venue) {
            where.venue = dto.venue;
        }

        const tickets = await this.prismaService.ticket.findMany({ where });

        const totalTickets = tickets.length;
        const closedTickets = tickets.filter(ticket => ticket.status === 'closed').length;
        const openTickets = tickets.filter(ticket => ticket.status === 'open').length;
        const inProgressTickets = tickets.filter(ticket => ticket.status === 'in-progress').length;

        const priorityDistribution = tickets.reduce((acc, ticket) => {
            acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
            return acc;
        }, {});

        const typeDistribution = tickets.reduce((acc, ticket) => {
            acc[ticket.type] = (acc[ticket.type] || 0) + 1;
            return acc;
        }, {});

        return {
            totalTickets,
            closedTickets,
            openTickets,
            inProgressTickets,
            priorityDistribution,
            typeDistribution,
            tickets
        };

    }
   
}
