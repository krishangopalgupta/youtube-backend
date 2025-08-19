class apiError extends Error{
    constructor(statusCode, message = "Something Went Wrong", success, error = [], stack = ""){
        this.statusCode = statusCode,
        this.message = message,
        this.success = false,
        this.data = null,
        this.error = error

        if(stack){
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export {apiError};