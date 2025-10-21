import { TaskService } from '../TaskService';
import { prisma } from '../../database/client';
import { TaskStatus, Priority } from '../../types';

// Mock the prisma client
jest.mock('../../database/client', () => ({
  prisma: {
    task: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as any;

describe('TaskService - updateTask', () => {
  let taskService: TaskService;

  beforeEach(() => {
    taskService = new TaskService();
    jest.clearAllMocks();
  });

  describe('updateTaskStatus', () => {
    it('peab uuendama ülesande staatust kui uus staatus on kehtiv', async () => {
      // Arrange
      const taskId = 'task-123';
      const newStatus = TaskStatus.IN_PROGRESS;
      const mockTask = {
        id: taskId,
        title: 'Test Task',
        status: TaskStatus.PENDING,
        priority: Priority.MEDIUM,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTask = {
        ...mockTask,
        status: newStatus,
        updatedAt: new Date(),
      };

      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockPrisma.task.update.mockResolvedValue(updatedTask);

      // Act
      const result = await taskService.updateTaskStatus(taskId, newStatus);

      // Assert
      expect(result).toEqual(updatedTask);
      expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: { status: newStatus },
      });
    });

    it('peab viskama vea kui ülesanne ei eksisteeri', async () => {
      // Arrange
      const taskId = 'non-existent-task';
      const newStatus = TaskStatus.IN_PROGRESS;

      mockPrisma.task.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(taskService.updateTaskStatus(taskId, newStatus)).rejects.toThrow(
        'Task not found'
      );
      expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(mockPrisma.task.update).not.toHaveBeenCalled();
    });

    it('peab viskama vea kui valmis ülesannet proovitakse muuta tagasi ootel', async () => {
      // Arrange
      const taskId = 'task-123';
      const newStatus = TaskStatus.PENDING;
      const mockTask = {
        id: taskId,
        title: 'Test Task',
        status: TaskStatus.COMPLETED,
        priority: Priority.MEDIUM,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      // Act & Assert
      await expect(taskService.updateTaskStatus(taskId, newStatus)).rejects.toThrow(
        'Cannot change completed task back to pending'
      );
      expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(mockPrisma.task.update).not.toHaveBeenCalled();
    });

    it('peab viskama vea kui uus staatus on kehtetu', async () => {
      // Arrange
      const taskId = 'task-123';
      const invalidStatus = 'INVALID_STATUS' as TaskStatus;

      // Act & Assert
      await expect(taskService.updateTaskStatus(taskId, invalidStatus)).rejects.toThrow(
        'Invalid task status'
      );
      expect(mockPrisma.task.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.task.update).not.toHaveBeenCalled();
    });

    it('peab lubama valmis ülesande muutmist tühistatuks', async () => {
      // Arrange
      const taskId = 'task-123';
      const newStatus = TaskStatus.CANCELLED;
      const mockTask = {
        id: taskId,
        title: 'Test Task',
        status: TaskStatus.COMPLETED,
        priority: Priority.MEDIUM,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTask = {
        ...mockTask,
        status: newStatus,
        updatedAt: new Date(),
      };

      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockPrisma.task.update.mockResolvedValue(updatedTask);

      // Act
      const result = await taskService.updateTaskStatus(taskId, newStatus);

      // Assert
      expect(result).toEqual(updatedTask);
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: { status: newStatus },
      });
    });
  });
});
