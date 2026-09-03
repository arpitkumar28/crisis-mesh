import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from '../entities/resource.entity';
import { Shelter } from '../entities/shelter.entity';

@Injectable()
export class ResponseService {
  constructor(
    @InjectRepository(Resource)
    private readonly resources: Repository<Resource>,
    @InjectRepository(Shelter) private readonly shelters: Repository<Shelter>,
  ) {}
  listResources() {
    return this.resources.find({
      relations: { location: true },
      order: { updated_at: 'DESC' },
    });
  }
  listShelters() {
    return this.shelters.find({
      relations: { location: true },
      order: { name: 'ASC' },
    });
  }
  async getResource(id: string) {
    const value = await this.resources.findOne({
      where: { id },
      relations: { location: true },
    });
    if (!value) throw new NotFoundException('Resource not found');
    return value;
  }
  async getShelter(id: string) {
    const value = await this.shelters.findOne({
      where: { id },
      relations: { location: true },
    });
    if (!value) throw new NotFoundException('Shelter not found');
    return value;
  }
}
