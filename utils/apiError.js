class ApiError {
    constructor(statusCode, message = 'Something Went Wrong', error = []) {
        this.statusCode = statusCode;
        this.error = error;
        this.message = message;
        this.data = null;
        this.success = false;
    }
}

export default ApiError;
