export interface ApiResponse<T> {
  status: {
    code: number;
    message: string;
    error: boolean;
    validationsErrors: { [key: string]: string[] } | null;
  };
  data: T | Pagination<T> | null;
}

export interface Pagination<T> {
  items: T[];
  meta: {
    count: number;
    skip: number;
    limit: number;
  };
}
