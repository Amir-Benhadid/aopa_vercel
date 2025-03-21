'use client';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { FormEvent, useEffect, useState } from 'react';

export default function AuthDebugPage() {
	const { user, isAuthenticated, isLoading, login } = useAuth();
	const [serverSession, setServerSession] = useState<any>(null);
	const [clientSession, setClientSession] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [debugKey, setDebugKey] = useState(0);

	// Login form state
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loginLoading, setLoginLoading] = useState(false);
	const [loginError, setLoginError] = useState<string | null>(null);
	const [loginResponse, setLoginResponse] = useState<any>(null);

	// Direct login with AuthProvider
	const handleDirectLogin = async (e: FormEvent) => {
		e.preventDefault();
		setLoginLoading(true);
		setLoginError(null);
		setLoginResponse(null);

		try {
			const response = await login(email, password);
			console.log('Direct login response:', response);
			setLoginResponse({
				method: 'auth-provider',
				success: true,
				data: response,
			});
			refreshData();
		} catch (err) {
			console.error('Direct login error:', err);
			setLoginError(`Direct login failed: ${(err as Error).message}`);
		} finally {
			setLoginLoading(false);
		}
	};

	// API login test
	const handleApiLogin = async (e: FormEvent) => {
		e.preventDefault();
		setLoginLoading(true);
		setLoginError(null);
		setLoginResponse(null);

		try {
			const res = await fetch('/api/auth-login-test', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();
			console.log('API login response:', data);

			setLoginResponse({
				method: 'api',
				success: data.success,
				data,
			});

			if (data.success) {
				refreshData();
			} else {
				setLoginError(`API login failed: ${data.error}`);
			}
		} catch (err) {
			console.error('API login error:', err);
			setLoginError(`API login failed: ${(err as Error).message}`);
		} finally {
			setLoginLoading(false);
		}
	};

	// Direct login with Supabase
	const handleSupabaseLogin = async (e: FormEvent) => {
		e.preventDefault();
		setLoginLoading(true);
		setLoginError(null);
		setLoginResponse(null);

		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) throw error;

			console.log('Supabase login response:', data);
			setLoginResponse({
				method: 'supabase-direct',
				success: true,
				data,
			});
			refreshData();
		} catch (err) {
			console.error('Supabase login error:', err);
			setLoginError(`Supabase login failed: ${(err as Error).message}`);
		} finally {
			setLoginLoading(false);
		}
	};

	// Fetch client session directly from Supabase
	const fetchClientSession = async () => {
		try {
			console.log('Fetching client session directly from Supabase');
			const { data, error } = await supabase.auth.getSession();
			if (error) throw error;

			console.log('Client session data:', data);
			setClientSession(data);
		} catch (err) {
			console.error('Error fetching client session:', err);
			setError((err as Error).message);
		}
	};

	// Fetch session info from server API
	const fetchServerSession = async () => {
		try {
			console.log('Fetching session from server API');
			const res = await fetch('/api/auth-test');
			if (!res.ok) throw new Error(`Server responded with ${res.status}`);

			const data = await res.json();
			console.log('Server session data:', data);
			setServerSession(data);
		} catch (err) {
			console.error('Error fetching server session:', err);
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	// Refresh the auth state
	const refreshData = () => {
		setLoading(true);
		setError(null);
		fetchClientSession();
		fetchServerSession();
		setDebugKey((prev) => prev + 1);
	};

	// Run on mount and when debug key changes
	useEffect(() => {
		refreshData();
	}, [debugKey]);

	// Display loading state
	if (loading && isLoading) {
		return (
			<div className="container mx-auto p-8">
				<h1 className="text-2xl font-bold mb-4">
					Loading Authentication Debug Data...
				</h1>
				<div className="animate-pulse">
					<div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
					<div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
					<div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-8">
			<h1 className="text-2xl font-bold mb-4">
				Authentication Debug Information
			</h1>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					<strong>Error:</strong> {error}
				</div>
			)}

			<button
				onClick={refreshData}
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6"
			>
				Refresh Auth State
			</button>

			{/* Test Login Forms */}
			<div className="bg-white shadow-md rounded p-6 mb-6">
				<h2 className="text-xl font-semibold mb-4">Test Authentication</h2>

				{loginError && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
						<strong>Login Error:</strong> {loginError}
					</div>
				)}

				{loginResponse && (
					<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
						<strong>Login Success with {loginResponse.method}!</strong>
						<pre className="mt-2 text-xs overflow-auto">
							{JSON.stringify(loginResponse, null, 2)}
						</pre>
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
					<div>
						<form onSubmit={handleDirectLogin} className="space-y-4">
							<div>
								<label className="block text-sm font-medium">Email</label>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium">Password</label>
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
								/>
							</div>
							<button
								type="submit"
								disabled={loginLoading}
								className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
							>
								{loginLoading ? 'Loading...' : 'Login with AuthProvider'}
							</button>
						</form>
					</div>

					<div>
						<form onSubmit={handleApiLogin} className="space-y-4">
							<div>
								<label className="block text-sm font-medium">Email</label>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium">Password</label>
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
								/>
							</div>
							<button
								type="submit"
								disabled={loginLoading}
								className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
							>
								{loginLoading ? 'Loading...' : 'Login with API'}
							</button>
						</form>
					</div>

					<div>
						<form onSubmit={handleSupabaseLogin} className="space-y-4">
							<div>
								<label className="block text-sm font-medium">Email</label>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium">Password</label>
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
								/>
							</div>
							<button
								type="submit"
								disabled={loginLoading}
								className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
							>
								{loginLoading ? 'Loading...' : 'Login with Supabase'}
							</button>
						</form>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Client Auth Context Data */}
				<div className="bg-white shadow-md rounded p-6">
					<h2 className="text-xl font-semibold mb-4">AuthContext State</h2>
					<div className="space-y-2">
						<div>
							<strong>Is Loading:</strong> {isLoading.toString()}
						</div>
						<div>
							<strong>Is Authenticated:</strong> {isAuthenticated.toString()}
						</div>
						<div>
							<strong>User:</strong> {user ? user.email : 'null'}
						</div>
					</div>
					<pre className="bg-gray-100 p-4 mt-4 rounded overflow-auto max-h-60">
						{JSON.stringify(user, null, 2)}
					</pre>
				</div>

				{/* Direct Client Session Data */}
				<div className="bg-white shadow-md rounded p-6">
					<h2 className="text-xl font-semibold mb-4">Direct Client Session</h2>
					<div className="space-y-2">
						<div>
							<strong>Has Session:</strong>{' '}
							{Boolean(clientSession?.session).toString()}
						</div>
					</div>
					<pre className="bg-gray-100 p-4 mt-4 rounded overflow-auto max-h-60">
						{JSON.stringify(clientSession, null, 2)}
					</pre>
				</div>

				{/* Server Session Data */}
				<div className="bg-white shadow-md rounded p-6">
					<h2 className="text-xl font-semibold mb-4">Server Session</h2>
					<div className="space-y-2">
						<div>
							<strong>Authenticated:</strong>{' '}
							{serverSession?.authenticated ? 'Yes' : 'No'}
						</div>
						<div>
							<strong>Session Exists:</strong>{' '}
							{serverSession?.session ? 'Yes' : 'No'}
						</div>
					</div>
					<pre className="bg-gray-100 p-4 mt-4 rounded overflow-auto max-h-60">
						{JSON.stringify(serverSession, null, 2)}
					</pre>
				</div>

				{/* Browser Cookies */}
				<div className="bg-white shadow-md rounded p-6">
					<h2 className="text-xl font-semibold mb-4">Auth Cookies</h2>
					<button
						onClick={() => {
							console.log('Document cookies:', document.cookie);
						}}
						className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded mb-4"
					>
						Log Cookies to Console
					</button>
					<div>
						<strong>Server Cookies:</strong>
						<ul className="list-disc list-inside">
							{serverSession?.cookies?.names.map((name: string) => (
								<li key={name}>{name}</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
