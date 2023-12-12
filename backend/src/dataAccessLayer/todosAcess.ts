import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('dataAccessLayer/todosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODOS_TABLE,
        private readonly todoIndex = process.env.INDEX_NAME
    ) { }

    // Get all todo method
    async getAllTodos(userId: string): Promise<TodoItem[]> {
       //Create query
        const result = await this.docClient.query({
            TableName: this.todoTable,
            IndexName: this.todoIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        })
            .promise()
        const items = result.Items
        return items as TodoItem[]
    }

    // Create todo method
    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        const result = await this.docClient
            .put({
                TableName: this.todoTable,
                Item: todoItem
            })
            .promise()
        return todoItem as TodoItem
    }

    // function update todo
    async updateTodoItem(todoId: string, userId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        
        //Update to do
        const result = await this.docClient.update({
            TableName: this.todoTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":name": todoUpdate.name,
                ":dueDate": todoUpdate.dueDate,
                ":done": todoUpdate.done
            },
            ReturnValues: 'ALL_NEW'
        }).promise()
        const updateItem = result.Attributes
        //Return value
        return updateItem as TodoUpdate
    }

    //  Delete item for todo method
    async deleteTodoItem(todoId: string, userId: string): Promise<string> {
        //Delete
        const result = await this.docClient.delete({
            TableName: this.todoTable,
            Key: {
                todoId,
                userId
            }
        }).promise()
        return todoId as string
    }
}