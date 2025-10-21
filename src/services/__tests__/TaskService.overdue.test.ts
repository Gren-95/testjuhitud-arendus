import { TaskService } from '../TaskService';
import { prisma } from '../../database/client';
import { TaskStatus, Priority } from '../../types';

// Mock the prisma client
jest.mock('../../database/client', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as any;

describe('TaskService - getOverdueTasks', () => {
  let taskService: TaskService;

  beforeEach(() => {
    taskService = new TaskService();
    jest.clearAllMocks();
  });

  describe('getOverdueTasks', () => {
    it('peab tagastama üle aja läinud ülesanded', async () => {
      // Arrange
      const mockOverdueTasks = [
        {
          id: 'task-1',
          title: 'Overdue Task 1',
          status: TaskStatus.PENDING,
          priority: Priority.HIGH,
          dueDate: new Date('2024-01-10T10:00:00Z'), // Past date
          userId: 'user-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-2',
          title: 'Overdue Task 2',
          status: TaskStatus.IN_PROGRESS,
          priority: Priority.MEDIUM,
          dueDate: new Date('2024-01-12T10:00:00Z'), // Past date
          userId: 'user-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.task.findMany.mockResolvedValue(mockOverdueTasks);

      // Act
      const result = await taskService.getOverdueTasks();

      // Assert
      expect(result).toEqual(mockOverdueTasks);
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {
          dueDate: {
            lt: new Date('2024-01-15T10:00:00Z'), // Mocked current date
          },
          status: {
            notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
      });
    });

    it('peab tagastama tühja massiivi kui üle aja läinud ülesandeid pole', async () => {
      // Arrange
      mockPrisma.task.findMany.mockResolvedValue([]);

      // Act
      const result = await taskService.getOverdueTasks();

      // Assert
      expect(result).toEqual([]);
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {
          dueDate: {
            lt: new Date('2024-01-15T10:00:00Z'), // Mocked current date
          },
          status: {
            notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
      });
    });

    it('peab ignoreerima valmis ülesandeid', async () => {
      // Arrange
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Completed Task',
          status: TaskStatus.COMPLETED,
          priority: Priority.HIGH,
          dueDate: new Date('2024-01-10T10:00:00Z'), // Past date but completed
          userId: 'user-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-2',
          title: 'Cancelled Task',
          status: TaskStatus.CANCELLED,
          priority: Priority.MEDIUM,
          dueDate: new Date('2024-01-12T10:00:00Z'), // Past date but cancelled
          userId: 'user-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.task.findMany.mockResolvedValue([]); // Should return empty because completed/cancelled are filtered out

      // Act
      const result = await taskService.getOverdueTasks();

      // Assert
      expect(result).toEqual([]);
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {
          dueDate: {
            lt: new Date('2024-01-15T10:00:00Z'), // Mocked current date
          },
          status: {
            notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
      });
    });

    it('peab ignoreerima tuleviku tähtaegadega ülesandeid', async () => {
      // Arrange
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Future Task',
          status: TaskStatus.PENDING,
          priority: Priority.HIGH,
          dueDate: new Date('2024-01-20T10:00:00Z'), // Future date
          userId: 'user-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.task.findMany.mockResolvedValue([]); // Should return empty because future tasks are filtered out

      // Act
      const result = await taskService.getOverdueTasks();

      // Assert
      expect(result).toEqual([]);
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {
          dueDate: {
            lt: new Date('2024-01-15T10:00:00Z'), // Mocked current date
          },
          status: {
            notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
      });
    });
  });
});
