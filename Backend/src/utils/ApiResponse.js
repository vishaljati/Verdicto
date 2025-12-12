class ApiResponse {
  constructor(statuscode, message = "", data) {
    this.statusCode = statuscode;
    this.data = data;
    this.message = message;
    this.success = statuscode < 400;
  }
}

export { ApiResponse }
