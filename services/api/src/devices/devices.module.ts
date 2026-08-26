import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MqttModule } from '../mqtt/mqtt.module';
import { AuthModule } from '../auth/auth.module';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { Device } from '../entities/device.entity';
import { Sensor } from '../entities/sensor.entity';
import { DeviceStatusHistory } from '../entities/device-status-history.entity';

@Module({
  imports: [
    MqttModule,
    AuthModule,
    TypeOrmModule.forFeature([Device, Sensor, DeviceStatusHistory]),
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
