import { User } from '../auth/user.entity';
import { CustomRepository } from '../helper/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { InternalServerErrorException, Logger } from '@nestjs/common';

@CustomRepository(Task)
export class TasksRepository extends Repository<Task> {
  private logger = new Logger('Taskrepository', { timestamp: true });
  public async getTaskById(id: string, user: User): Promise<Task> {
    const task = this.findOne({ where: { id, user } });
    return task;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = this.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    await this.save(task);
    return task;
  }

  async getTasks(filterDto: GetTaskFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = this.createQueryBuilder('Task');
    query.where({ user });

    if (status) {
      query.andWhere('Task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(Task.title) LIKE LOWER(:search) OR LOWER(Task.d escription) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }
    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(
        `Fail to get tasks for user: ${
          user.username
        } by filter Dto: ${JSON.stringify(filterDto)} `,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
