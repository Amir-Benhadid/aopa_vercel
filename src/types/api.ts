export interface ApiResponse<T> {
	data: T | null;
	error: Error | null;
}

export interface PaginatedResponse<T> {
	data: T[];
	count: number;
	page: number;
	pageSize: number;
	hasNextPage: boolean;
}
