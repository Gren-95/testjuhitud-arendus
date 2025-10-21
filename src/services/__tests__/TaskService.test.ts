import { TaskService } from '../TaskService';
import { prisma } from '../../database/client';
import { TaskStatus, Priority } from '../../types';

// Mock the prisma client
jest.mock('../../database/client', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    task: {
      create: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as any;

describe('TaskService', () => {
  let taskService: TaskService;

  beforeEach(() => {
    taskService = new TaskService();
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('peab looma ülesande kui kasutaja eksisteerib ja pealkiri on olemas', async () => {
      // Arrange
      const userId = 'user-123';
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: Priority.MEDIUM,
        userId,
      };

      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        priority: Priority.MEDIUM,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.task.create.mockResolvedValue(mockTask);

      // Act
      const result = await taskService.createTask(taskData);

      // Assert
      expect(result).toEqual(mockTask);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          userId: taskData.userId,
          status: TaskStatus.PENDING,
        },
      });
    });

    it('peab viskama vea kui kasutaja ei eksisteeri', async () => {
      // Arrange
      const userId = 'non-existent-user';
      const taskData = {
        title: 'Test Task',
        userId,
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(taskService.createTask(taskData)).rejects.toThrow(
        'User not found'
      );
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrisma.task.create).not.toHaveBeenCalled();
    });

    it('peab viskama vea kui pealkiri on tühi', async () => {
      // Arrange
      const userId = 'user-123';
      const taskData = {
        title: '',
        userId,
      };

      // Act & Assert
      await expect(taskService.createTask(taskData)).rejects.toThrow(
        'Title cannot be empty'
      );
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.task.create).not.toHaveBeenCalled();
    });

    it('peab viskama vea kui pealkiri on ainult tühikud', async () => {
      // Arrange
      const userId = 'user-123';
      const taskData = {
        title: '   ',
        userId,
      };

      // Act & Assert
      await expect(taskService.createTask(taskData)).rejects.toThrow(
        'Title cannot be empty'
      );
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.task.create).not.toHaveBeenCalled();
    });
  });
});
