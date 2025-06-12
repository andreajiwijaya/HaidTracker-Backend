class AppError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export default AppError;