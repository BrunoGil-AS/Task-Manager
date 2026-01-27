export default class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = "ERROR"
  ) {
    super(message);
    this.name = "ApiError";
  }
}
