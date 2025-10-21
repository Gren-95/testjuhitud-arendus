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
}
