import { configStorage } from "@components/sidebar/listeners/formPersistence";
import { messageApi, ArrayMessagetotext } from "@utils/fetch/commentapi";
import { SendQuestion } from "@components/chat/input";

// Tipos
interface TaskConfig {
  isActive: boolean;
  timeout: number;
  name: string;
}

interface TaskManager {
  intervalId: NodeJS.Timeout | null;
  isRunning: boolean;
  config: TaskConfig;
}

// Gestor global de tareas
class TaskScheduler {
  private tasks: Map<string, TaskManager> = new Map();

  // Registrar una nueva tarea
  registerTask(taskName: string, taskConfig: TaskConfig, taskFunction: () => Promise<void>): void {
    if (this.tasks.has(taskName)) {
      this.stopTask(taskName);
    }

    this.tasks.set(taskName, {
      intervalId: null,
      isRunning: false,
      config: taskConfig
    });

    if (taskConfig.isActive) {
      this.startTask(taskName, taskFunction);
    }
  }

  // Iniciar una tarea específica
  startTask(taskName: string, taskFunction: () => Promise<void>): void {
    const task = this.tasks.get(taskName);
    if (!task || task.isRunning) return;

    console.log(`Iniciando tarea: ${taskName}`);
    
    task.intervalId = setInterval(async () => {
      try {
        await taskFunction();
      } catch (error) {
        console.error(`Error en tarea ${taskName}:`, error);
      }
    }, task.config.timeout);

    task.isRunning = true;
  }

  // Detener una tarea específica
  stopTask(taskName: string): void {
    const task = this.tasks.get(taskName);
    if (!task || !task.isRunning) return;

    if (task.intervalId) {
      clearInterval(task.intervalId);
      task.intervalId = null;
    }
    
    task.isRunning = false;
    console.log(`Tarea detenida: ${taskName}`);
  }

  // Reiniciar una tarea
  restartTask(taskName: string, taskFunction: () => Promise<void>): void {
    this.stopTask(taskName);
    const task = this.tasks.get(taskName);
    if (task && task.config.isActive) {
      this.startTask(taskName, taskFunction);
    }
  }

  // Actualizar configuración de una tarea
  updateTaskConfig(taskName: string, newConfig: Partial<TaskConfig>): void {
    const task = this.tasks.get(taskName);
    if (!task) return;

    const wasRunning = task.isRunning;
    this.stopTask(taskName);

    task.config = { ...task.config, ...newConfig };

    if (wasRunning && task.config.isActive) {
      // Necesitamos la función de la tarea para reiniciarla
      console.log(`Configuración actualizada para ${taskName}. Reinicia manualmente si es necesario.`);
    }
  }

  // Obtener estado de todas las tareas
  getTasksStatus(): Record<string, { isRunning: boolean; config: TaskConfig }> {
    const status: Record<string, { isRunning: boolean; config: TaskConfig }> = {};
    
    this.tasks.forEach((task, name) => {
      status[name] = {
        isRunning: task.isRunning,
        config: { ...task.config }
      };
    });

    return status;
  }

  // Detener todas las tareas
  stopAllTasks(): void {
    this.tasks.forEach((_, taskName) => {
      this.stopTask(taskName);
    });
  }
}

// Instancia global del gestor de tareas
export const taskScheduler = new TaskScheduler();

// Tarea específica de comentarios
class CommentTask {
  private static readonly TASK_NAME = 'comment_task';
  private static readonly DEFAULT_TIMEOUT = 5;

  static async initialize(): Promise<void> {
    try {
      const config = await this.loadConfig();
      
      taskScheduler.registerTask(
        this.TASK_NAME,
        config,
        this.executeTask.bind(this)
      );

      console.log(`Tarea ${this.TASK_NAME} inicializada:`, config);
    } catch (error) {
      console.error(`Error al inicializar ${this.TASK_NAME}:`, error);
    }
  }

  private static async loadConfig(): Promise<TaskConfig> {
    const alldata = await configStorage.getAll();
    console.log("Configuración cargada:", alldata);
    
    // Obtener el valor guardado o usar true por defecto
    const savedValue = alldata.comment_task;
    const isActive = savedValue !== undefined ? savedValue === 'true' : true;
    
    // Solo guardar si no existe un valor previo
    if (savedValue === undefined) {
      await configStorage.save('comment_task', 'true');
    }
    
    const timeout = (Number(alldata.comment_timeout) || this.DEFAULT_TIMEOUT) * 1000;
    
    return {
      isActive,
      timeout,
      name: this.TASK_NAME
    };
  }

  private static async executeTask(): Promise<void> {
      
      const ExistMessages = await messageApi.getAllBoolean(false);
      
    if (!ExistMessages.messages || ExistMessages.messages.length === 0) {
        console.log("No hay mensajes para procesar");
        return;
    } else {
        console.log("Ejecutando tarea de comentarios...",ExistMessages.messages.length);
    }

    const text = ArrayMessagetotext([...ExistMessages.messages]);
    const messageIds = ExistMessages.messages.map((item) => item.id);
    
    console.log("Procesando texto:", text);
    await SendQuestion(text, messageIds);
  }

  // Métodos públicos para controlar esta tarea específica
  static async updateConfig(): Promise<void> {
    const newConfig = await this.loadConfig();
    taskScheduler.updateTaskConfig(this.TASK_NAME, newConfig);
  }

  static start(): void {
    taskScheduler.startTask(this.TASK_NAME, this.executeTask.bind(this));
  }

  static stop(): void {
    taskScheduler.stopTask(this.TASK_NAME);
  }

  static async restart(): Promise<void> {
    await this.updateConfig();
    taskScheduler.restartTask(this.TASK_NAME, this.executeTask.bind(this));
  }
}

// Inicializar la tarea de comentarios
CommentTask.initialize();

// Exportar para uso externo
export { CommentTask, TaskScheduler };

// Ejemplo de cómo agregar más tareas:
/*
class NotificationTask {
  private static readonly TASK_NAME = 'notification_task';
  
  static async initialize(): Promise<void> {
    const config = {
      isActive: true,
      timeout: 10000,
      name: this.TASK_NAME
    };
    
    taskScheduler.registerTask(
      this.TASK_NAME,
      config,
      this.executeTask.bind(this)
    );
  }
  
  private static async executeTask(): Promise<void> {
    console.log("Ejecutando tarea de notificaciones...");
    // Lógica de la tarea aquí
  }
}

// NotificationTask.initialize();
*/