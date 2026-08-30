import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { DevicesService, CreateDeviceDto, UpdateDeviceDto } from './devices.service';
import { Device, DeviceStatus, DeviceType } from '../entities/device.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRoleEnum } from '../entities/profile.entity';

@Controller('v1/devices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER)
  @HttpCode(HttpStatus.CREATED)
  async createDevice(@Body() createDto: CreateDeviceDto) {
    const device = await this.devicesService.createDevice(createDto);
    return {
      success: true,
      message: 'Device created successfully',
      data: device,
    };
  }

  @Get()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER, UserRoleEnum.ANALYST, UserRoleEnum.CITIZEN)
  async getAllDevices() {
    const devices = await this.devicesService.getAllDevices();
    return {
      success: true,
      message: 'Devices retrieved successfully',
      data: devices,
    };
  }

  @Get('count')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER, UserRoleEnum.ANALYST, UserRoleEnum.CITIZEN)
  async getDeviceCount() {
    const count = await this.devicesService.getDeviceCount();
    return {
      success: true,
      message: 'Device count retrieved successfully',
      data: { count },
    };
  }

  @Get('count/by-status')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER, UserRoleEnum.ANALYST, UserRoleEnum.CITIZEN)
  async getDeviceCountByStatus() {
    const counts = await this.devicesService.getDeviceCountByStatus();
    return {
      success: true,
      message: 'Device count by status retrieved successfully',
      data: counts,
    };
  }

  @Get('online')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER, UserRoleEnum.ANALYST, UserRoleEnum.CITIZEN)
  async getOnlineDevices() {
    const devices = await this.devicesService.getOnlineDevices();
    return {
      success: true,
      message: 'Online devices retrieved successfully',
      data: devices,
    };
  }

  @Get('offline')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER, UserRoleEnum.ANALYST, UserRoleEnum.CITIZEN)
  async getOfflineDevices() {
    const devices = await this.devicesService.getOfflineDevices();
    return {
      success: true,
      message: 'Offline devices retrieved successfully',
      data: devices,
    };
  }

  @Get('status/:status')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER, UserRoleEnum.ANALYST, UserRoleEnum.CITIZEN)
  async getDevicesByStatus(@Param('status') status: DeviceStatus) {
    const devices = await this.devicesService.getDevicesByStatus(status);
    return {
      success: true,
      message: `Devices with status ${status} retrieved successfully`,
      data: devices,
    };
  }

  @Get('type/:type')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER, UserRoleEnum.ANALYST, UserRoleEnum.CITIZEN)
  async getDevicesByType(@Param('type') type: DeviceType) {
    const devices = await this.devicesService.getDevicesByType(type);
    return {
      success: true,
      message: `Devices with type ${type} retrieved successfully`,
      data: devices,
    };
  }

  @Get(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER, UserRoleEnum.ANALYST, UserRoleEnum.CITIZEN)
  async getDeviceById(@Param('id') id: string) {
    const device = await this.devicesService.getDeviceById(id);
    return {
      success: true,
      message: 'Device retrieved successfully',
      data: device,
    };
  }

  @Get(':id/sensors')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER, UserRoleEnum.ANALYST, UserRoleEnum.CITIZEN)
  async getDeviceSensors(@Param('id') id: string) {
    const sensors = await this.devicesService.getDeviceSensors(id);
    return {
      success: true,
      message: 'Device sensors retrieved successfully',
      data: sensors,
    };
  }

  @Get(':id/status/history')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER, UserRoleEnum.ANALYST, UserRoleEnum.CITIZEN)
  async getDeviceStatusHistory(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const history = await this.devicesService.getDeviceStatusHistory(
      id,
      limit ? parseInt(limit) : 50,
    );
    return {
      success: true,
      message: 'Device status history retrieved successfully',
      data: history,
    };
  }

  @Put(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER)
  async updateDevice(@Param('id') id: string, @Body() updateDto: UpdateDeviceDto) {
    const device = await this.devicesService.updateDevice(id, updateDto);
    return {
      success: true,
      message: 'Device updated successfully',
      data: device,
    };
  }

  @Put(':id/status')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER)
  async updateDeviceStatus(
    @Param('id') id: string,
    @Body() body: { status: DeviceStatus; battery_level?: number; signal_strength?: number },
  ) {
    const device = await this.devicesService.updateDeviceStatus(
      id,
      body.status,
      { battery_level: body.battery_level, signal_strength: body.signal_strength },
    );
    return {
      success: true,
      message: 'Device status updated successfully',
      data: device,
    };
  }

  @Post(':id/sensors')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY)
  async addSensorToDevice(
    @Param('id') id: string,
    @Body() sensorData: { name: string; metric: string; unit: string; min_value?: number; max_value?: number },
  ) {
    const sensor = await this.devicesService.addSensorToDevice(id, sensorData);
    return {
      success: true,
      message: 'Sensor added to device successfully',
      data: sensor,
    };
  }

  @Delete(':id')
  @Roles(UserRoleEnum.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevice(@Param('id') id: string) {
    await this.devicesService.deleteDevice(id);
    return {
      success: true,
      message: 'Device deleted successfully',
    };
  }
}
