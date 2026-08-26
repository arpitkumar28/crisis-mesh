import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './roles.decorator';
import { CurrentUser } from './current-user.decorator';
import { ClientInfo } from '../common/decorators/client-info.decorator';
import { UserRoleEnum } from '../entities/profile.entity';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto, @ClientInfo() clientInfo: { ip: string; userAgent: string }) {
    const result = await this.authService.register(registerDto, clientInfo.ip, clientInfo.userAgent);
    return {
      success: true,
      message: 'Registration successful',
      data: result,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @ClientInfo() clientInfo: { ip: string; userAgent: string }) {
    const result = await this.authService.login(loginDto, clientInfo.ip, clientInfo.userAgent);
    return {
      success: true,
      message: 'Login successful',
      data: result,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(refreshTokenDto.refresh_token);
    return {
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: any) {
    return {
      success: true,
      message: 'User retrieved successfully',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: any, @ClientInfo() clientInfo: { ip: string; userAgent: string }) {
    // In a JWT stateless setup, logout is primarily client-side
    // However, we can add the token to a blacklist if needed
    return {
      success: true,
      message: 'Logout successful',
    };
  }

  @Post('admin/assign-role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @HttpCode(HttpStatus.OK)
  async assignRole(
    @CurrentUser() user: any,
    @Body() body: { userId: string; role: UserRoleEnum },
    @ClientInfo() clientInfo: { ip: string; userAgent: string },
  ) {
    await this.authService.assignRole(body.userId, body.role, user.id);
    return {
      success: true,
      message: 'Role assigned successfully',
    };
  }

  @Post('admin/remove-role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @HttpCode(HttpStatus.OK)
  async removeRole(
    @CurrentUser() user: any,
    @Body() body: { userId: string; role: UserRoleEnum },
  ) {
    await this.authService.removeRole(body.userId, body.role);
    return {
      success: true,
      message: 'Role removed successfully',
    };
  }
}
