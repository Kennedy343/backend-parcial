// src/tasks/tasks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepo: Repository<Task>,
  ) {}

  async create(dto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepo.create(dto);
    return this.tasksRepo.save(task);
  }

  findAll(): Promise<Task[]> {
    return this.tasksRepo.find();
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task con id ${id} no encontrada`);
    return task;
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, dto);
    return this.tasksRepo.save(task);
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.tasksRepo.remove(task);
  }

async toggleDone(id: number): Promise<Task> {
    const task = await this.findOne(id);
    task.done = !task.done;
    return this.tasksRepo.save(task);
  }


}
