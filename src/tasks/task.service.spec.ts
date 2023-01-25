import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { User } from 'src/auth/user.entity';
import { TaskStatus } from './task-status.enum';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

const mockTaskRespository = () => ({
  getTasks: jest.fn(),
  getTaskById: jest.fn(),
});

const mockUser: User = {
  username: 'KhoiKB',
  id: 'someID',
  task: [],
  password: '',
};

describe('TaskService', () => {
  let taskSerice: TasksService;
  let taskRespository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useFactory: mockTaskRespository },
      ],
    }).compile();
    taskSerice = module.get(TasksService);
    taskRespository = module.get(TasksRepository);
  });

  describe('getTasks', () => {
    it('Calls TasksRepository.getTask and returns the results', async () => {
      taskRespository.getTasks.mockResolvedValue('someValue');
      const result = await taskSerice.getTask(null, mockUser);
      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('calls TasksRepository.findOne and returns the result', async () => {
      const mockTask = {
        title: 'my title',
        description: 'test description',
        id: 'my id',
        status: TaskStatus.OPEN,
      };

      taskRespository.getTaskById.mockResolvedValue(mockTask);
      const result = await taskSerice.getTaskById('someId', mockUser);
      expect(result).toEqual(mockTask);
    });

    it('calls TasksRepository.findOne and handle error', async () => {
      taskRespository.getTaskById.mockResolvedValue(null);
      expect(taskSerice.getTaskById('someId', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
