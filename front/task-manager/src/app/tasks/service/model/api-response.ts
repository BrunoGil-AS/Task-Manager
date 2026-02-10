export default interface ApiResponse {
  success: boolean;
  data: any[];
  count: number;
  page: number;
  pageSize: number;
}
