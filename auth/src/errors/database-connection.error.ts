import { CustomError } from "./custom.error";

export class DatabaseConnectionError extends CustomError{
    statusCode = 500;
    reason = 'Error connecting Database';

    constructor(){
        super('Invalid Request Parameters');
        Object.setPrototypeOf(this,DatabaseConnectionError.prototype);
    }

    serializeError(){
        return [
            {message:this.reason}
        ]
    }
}