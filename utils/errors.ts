export class APIError extends Error {
  constructor(public override message: string, public statusCode: number) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
  }
}
