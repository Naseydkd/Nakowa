export class ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;

  constructor(success: boolean, data?: T, message?: string, error?: string) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data?: T, message?: string): ApiResponse<T> {
    return new ApiResponse(true, data, message);
  }

  static error(error: string, message?: string): ApiResponse {
    return new ApiResponse(false, undefined, message, error);
  }
}

export class SuccessResponse<T = any> extends ApiResponse<T> {
  constructor(data?: T, message?: string) {
    super(true, data, message);
  }
}

export class ErrorResponse extends ApiResponse {
  constructor(error: string, message?: string) {
    super(false, undefined, message, error);
  }
}