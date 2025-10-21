import { prisma } from '../database/client';
import { CreateTaskInput, Task, TaskStatus } from '../types';

export class TaskService {
  async createTask(input: CreateTaskInput): Promise<Task> {
    // Validate title is not empty
    if (!input.title || input.title.trim() === '') {
      throw new Error('Title cannot be empty');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority || 'MEDIUM',
        userId: input.userId,
        status: TaskStatus.PENDING,
        dueDate: input.dueDate,
      },
    });

    return task as Task;
  }

  async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<Task> {
    // Validate status
    if (!Object.values(TaskStatus).includes(newStatus)) {
      throw new Error('Invalid task status');
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      throw new Error('Task not found');
    }

    // Business rule: Cannot change completed task back to pending
    if (existingTask.status === TaskStatus.COMPLETED && newStatus === TaskStatus.PENDING) {
      throw new Error('Cannot change completed task back to pending');
    }

    // Update task status
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    });

    return updatedTask as Task;
  }

  async getOverdueTasks(): Promise<Task[]> {
    const currentDate = new Date();
    
    const overdueTasks = await prisma.task.findMany({
      where: {
        dueDate: {
          lt: currentDate, // Less than current date
        },
        status: {
          notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return overdueTasks as Task[];
  }
}
