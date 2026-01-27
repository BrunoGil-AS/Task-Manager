import Task from '../../models/task.model';

export default interface ApiResponse {
  data: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
