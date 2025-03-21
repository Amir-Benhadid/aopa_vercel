export type UserRole = 'admin' | 'basic' | 'sponsor' | 'doctor' | 'manager';

export interface User {
	id: string;
	email: string;
	name?: string;
	role: 'user' | 'admin';
}

export interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	isLoading: boolean;
}
