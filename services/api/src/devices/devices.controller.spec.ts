import { Test, TestingModule } from '@nestjs/testing';
import { DevicesController } from './devices.controller';
import { DevicesService, CreateDeviceDto, UpdateDeviceDto } from './devices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRoleEnum } from '../entities/profile.entity';
import { DeviceType, DeviceStatus } from '../entities/device.entity';

describe('DevicesController', () => {
  let controller: DevicesController;
  let devicesService: DevicesService;

  const mockDevicesService = {
    createDevice: jest.fn(),
    getAllDevices: jest.fn(),
    getDeviceCount: jest.fn(),
    getDeviceCountByStatus: jest.fn(),
    getOnlineDevices: jest.fn(),
    getOfflineDevices: jest.fn(),
    getDevicesByStatus: jest.fn(),
    getDevicesByType: jest.fn(),
    getDeviceById: jest.fn(),
    getDeviceSensors: jest.fn(),
    getDeviceStatusHistory: jest.fn(),
    updateDevice: jest.fn(),
    updateDeviceStatus: jest.fn(),
    addSensorToDevice: jest.fn(),
    deleteDevice: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [
        {
          provide: DevicesService,
          useValue: mockDevicesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<DevicesController>(DevicesController);
    devicesService = module.get<DevicesService>(DevicesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDevice', () => {
    it('should create a device successfully', async () => {
      const createDto: CreateDeviceDto = {
        name: 'Test Device',
        type: DeviceType.SENSOR,
        location_id: 'location-id',
      };

      const mockDevice = {
        id: 'device-id',
        name: 'Test Device',
        type: DeviceType.SENSOR,
      };

      mockDevicesService.createDevice.mockResolvedValue(mockDevice);

      const result = await controller.createDevice(createDto);

      expect(result).toEqual({
        success: true,
        message: 'Device created successfully',
        data: mockDevice,
      });
      expect(mockDevicesService.createDevice).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getAllDevices', () => {
    it('should get all devices successfully', async () => {
      const mockDevices = [
        { id: 'device-1', name: 'Device 1' },
        { id: 'device-2', name: 'Device 2' },
      ];

      mockDevicesService.getAllDevices.mockResolvedValue(mockDevices);

      const result = await controller.getAllDevices();

      expect(result).toEqual({
        success: true,
        message: 'Devices retrieved successfully',
        data: mockDevices,
      });
      expect(mockDevicesService.getAllDevices).toHaveBeenCalled();
    });
  });

  describe('getDeviceCount', () => {
    it('should get device count successfully', async () => {
      mockDevicesService.getDeviceCount.mockResolvedValue(10);

      const result = await controller.getDeviceCount();

      expect(result).toEqual({
        success: true,
        message: 'Device count retrieved successfully',
        data: { count: 10 },
      });
      expect(mockDevicesService.getDeviceCount).toHaveBeenCalled();
    });
  });

  describe('getDeviceById', () => {
    it('should get device by id successfully', async () => {
      const mockDevice = {
        id: 'device-id',
        name: 'Test Device',
      };

      mockDevicesService.getDeviceById.mockResolvedValue(mockDevice);

      const result = await controller.getDeviceById('device-id');

      expect(result).toEqual({
        success: true,
        message: 'Device retrieved successfully',
        data: mockDevice,
      });
      expect(mockDevicesService.getDeviceById).toHaveBeenCalledWith('device-id');
    });
  });

  describe('updateDevice', () => {
    it('should update device successfully', async () => {
      const updateDto: UpdateDeviceDto = {
        name: 'Updated Device',
      };

      const mockDevice = {
        id: 'device-id',
        name: 'Updated Device',
      };

      mockDevicesService.updateDevice.mockResolvedValue(mockDevice);

      const result = await controller.updateDevice('device-id', updateDto);

      expect(result).toEqual({
        success: true,
        message: 'Device updated successfully',
        data: mockDevice,
      });
      expect(mockDevicesService.updateDevice).toHaveBeenCalledWith('device-id', updateDto);
    });
  });

  describe('deleteDevice', () => {
    it('should delete device successfully', async () => {
      mockDevicesService.deleteDevice.mockResolvedValue(undefined);

      const result = await controller.deleteDevice('device-id');

      expect(result).toEqual({
        success: true,
        message: 'Device deleted successfully',
      });
      expect(mockDevicesService.deleteDevice).toHaveBeenCalledWith('device-id');
    });
  });
});
