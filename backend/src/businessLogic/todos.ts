import { TodosAccess } from '../dataAccessLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

// Init const
const logger = createLogger('TodosAccess')
const attachmentUtils = new AttachmentUtils()
const todosAcess = new TodosAccess()

// Create Todo method
export async function createTodo(newTodo: CreateTodoRequest, userId: string): Promise<TodoItem> {
    logger.info("Create Todo method")
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
    const newItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl: s3AttachmentUrl,
        ...newTodo
    }

    return await todosAcess.createTodoItem(newItem)
}

// Get todo by userID
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('Info-> Start get todo by user')
    return todosAcess.getAllTodos(userId)
}

// Update todo method
export async function updateTodo(
    todoId: string,
    todoUpdate: UpdateTodoRequest,
    userId: string): Promise<TodoUpdate> {
    logger.info('Info->Start handle update todo method')
    return todosAcess.updateTodoItem(todoId, userId, todoUpdate)
}




//Create attachment method
export async function createAttachmentPresignedUrl(todoId: string, userId: string): Promise<string> {
    logger.info('Info-> Create attachment method by: ', userId, todoId)
    return attachmentUtils.getUploadUrl(todoId)
}

// Delete todo method
export async function deleteTodo(
    todoId: string,
    userId: string): Promise<string> {
    logger.info('Info-> Start handle delete todo method')
    return todosAcess.deleteTodoItem(todoId, userId)
}