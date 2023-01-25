import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../auth/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(private readonly taskRespository: TasksRepository) {}

  async getTaskById(id: string, user: User): Promise<Task> {
    const found = await this.taskRespository.getTaskById(id, user);

    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return found;
  }

  async getTask(filterDto: GetTaskFilterDto, user: User): Promise<Task[]> {
    return this.taskRespository.getTasks(filterDto, user);
  }

  async deleteTaskById(id: string, user: User): Promise<void> {
    try {
      const result = await this.taskRespository.delete({ id, user });
      if (result.affected == 0) {
        throw new NotFoundException(`Task with ID "${id}"  not found`, {
          cause: new Error(),
          description: 'Not Found',
        });
      }
    } catch (ex) {
      throw ex;
    }
  }

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await this.taskRespository.save(task);
    return task;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.taskRespository.createTask(createTaskDto, user);
  }
}
