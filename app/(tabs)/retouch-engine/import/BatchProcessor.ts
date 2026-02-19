// Copyright © Knoux. All rights reserved.
/**
 * ⚙️ Retouch Engine — Batch Processor
 * معالج الدُفعات للتطبيق الجماعي
 */

export interface ProcessingTask {
  id: string;
  uri: string;
  name: string;
  services: string[];
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  result?: string;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface ProcessingOptions {
  intensity: number;
  naturalLook: boolean;
  preserveExif?: boolean;
  outputQuality?: number;
}

export interface BatchResult {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  totalTimeMs: number;
  tasks: ProcessingTask[];
}

type ProgressCallback = (tasks: ProcessingTask[]) => void;

export class BatchProcessor {
  private queue: ProcessingTask[] = [];
  private isRunning = false;
  private cancelRequested = false;
  private progressListeners: ProgressCallback[] = [];

  get busy(): boolean { return this.isRunning; }
  get queueSize(): number { return this.queue.length; }

  addToQueue(uri: string, name: string, services: string[]): ProcessingTask {
    const task: ProcessingTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      uri,
      name,
      services,
      status: 'pending',
      progress: 0,
    };
    this.queue.push(task);
    return task;
  }

  removeFromQueue(id: string): void {
    this.queue = this.queue.filter((t) => t.id !== id);
  }

  clearQueue(): void { this.queue = []; }

  async processAll(options: ProcessingOptions, onProgress?: ProgressCallback): Promise<BatchResult> {
    if (this.isRunning) throw new Error('معالجة جارية بالفعل');
    this.isRunning = true;
    this.cancelRequested = false;

    const start = Date.now();
    let successCount = 0;
    let errorCount = 0;

    for (const task of this.queue) {
      if (this.cancelRequested) break;

      task.status = 'processing';
      task.startedAt = Date.now();
      task.progress = 0;
      onProgress?.(this.queue);

      try {
        for (let p = 0; p <= 100; p += 20) {
          if (this.cancelRequested) break;
          task.progress = p;
          onProgress?.(this.queue);
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        task.status = 'done';
        task.progress = 100;
        task.result = task.uri;
        task.completedAt = Date.now();
        successCount++;
      } catch (err) {
        task.status = 'error';
        task.error = err instanceof Error ? err.message : 'خطأ غير معروف';
        task.completedAt = Date.now();
        errorCount++;
      }

      onProgress?.(this.queue);
    }

    this.isRunning = false;
    return {
      totalProcessed: successCount + errorCount,
      successCount,
      errorCount,
      totalTimeMs: Date.now() - start,
      tasks: this.queue,
    };
  }

  cancel(): void { this.cancelRequested = true; }

  getPendingTasks(): ProcessingTask[] { return this.queue.filter((t) => t.status === 'pending'); }
  getDoneTasks(): ProcessingTask[] { return this.queue.filter((t) => t.status === 'done'); }
  getFailedTasks(): ProcessingTask[] { return this.queue.filter((t) => t.status === 'error'); }
}

export const batchProcessor = new BatchProcessor();
