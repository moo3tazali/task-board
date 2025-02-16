export interface ApiResponse<T> {
  status: {
    code: number;
    message: string;
    error: boolean;
    validationsErrors: { [key: string]: string[] } | null;
  };
  data: T | ApiPaginatedResponse<T> | null;
}

export interface ApiPaginatedResponse<T> {
  items: T[];
  meta: {
    count: number;
    skip: number;
    limit: number;
  };
}
