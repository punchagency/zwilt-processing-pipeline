export default class ClientResponse {
  statusCode: number | null;
  success: boolean | null;
  message: string | null;
  data: object | null | undefined;
  count: number | null | undefined;
  constructor(
    statusCode: number | null,
    success: boolean | null,
    message: string | null,
    data?: object | null,
    count?: number | null
  ) {
    this.statusCode = statusCode;
    this.success = success;
    this.message = message;
    this.data = data;
    this.count = count;
  }
}
