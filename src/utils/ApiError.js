class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message) //This calls the parent class’s constructor (from the Error class) and passes the message parameter. This ensures the error message is set properly.
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError};
/*
This ApiError class is useful in scenarios where you need a 
consistent way to handle errors in an API response. It captures 
an error’s message, status code, detailed error information, and
the stack trace for easier debugging. It can be used to throw 
custom errors in API routes or middleware, making error handling
more structured and informative.
*/