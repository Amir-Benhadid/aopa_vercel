import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';

// Define User interface to match the one in AuthProvider
interface User {
	id: string;
	email: string;
	name?: string;
	surname?: string;
	role?: string;
}

interface UseContentAccessProps {
	congressId?: string;
}

export function useContentAccess({ congressId }: UseContentAccessProps = {}) {
	const { isAuthenticated, user } = useAuth();
	const [hasAccess, setHasAccess] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function checkAccess() {
			setIsLoading(true);
			setError(null);

			try {
				// Not authenticated users don't have access
				if (!isAuthenticated || !user) {
					setHasAccess(false);
					setIsLoading(false);
					return;
				}

				// Admin users always have access
				if (user.role === 'admin') {
					setHasAccess(true);
					setIsLoading(false);
					return;
				}

				// Get user's account info to check cotisation
				const { data: account, error: accountError } = await supabase
					.from('accounts')
					.select('*') // Select all fields to check what's available
					.eq('user_id', user.id)
					.single();

				if (accountError) {
					console.error('Error fetching account:', accountError);
					setError('Error checking account status');
					setHasAccess(false);
					setIsLoading(false);
					return;
				}

				// Debug logs
				console.log('Account data:', account);
				console.log(
					'Account has cotisation field:',
					account && 'cotisation' in account
				);

				// If user has cotisation field and it's true, they have access
				if (account && 'cotisation' in account && account.cotisation === true) {
					console.log('User has active cotisation, granting access');
					setHasAccess(true);
					setIsLoading(false);
					return;
				}

				// If no congress ID is provided, we only check for admin and cotisation
				if (!congressId) {
					setHasAccess(false);
					setIsLoading(false);
					return;
				}

				// Ensure we have an account ID before checking inscriptions
				if (!account || !account.id) {
					console.log('Account not found or missing ID');
					setHasAccess(false);
					setIsLoading(false);
					return;
				}

				// Check if the user has a valid inscription for this congress using account_id
				const { data: inscriptions, error: inscriptionsError } = await supabase
					.from('inscriptions')
					.select('id')
					.eq('account_id', account.id)
					.eq('congress_id', congressId);

				if (inscriptionsError) {
					console.error('Error fetching inscriptions:', inscriptionsError);
					setError('Error checking registrations');
					setHasAccess(false);
					setIsLoading(false);
					return;
				}

				// If user has inscriptions, check for paid invoices linked to those inscriptions
				let hasPaidInvoice = false;

				if (inscriptions && inscriptions.length > 0) {
					console.log('Found inscriptions:', inscriptions);

					// Get inscription IDs
					const inscriptionIds = inscriptions.map(
						(inscription: { id: string }) => inscription.id
					);

					// Check if user has at least one paid invoice for these inscriptions
					const { data: inscriptionInvoices, error: invoicesError } =
						await supabase
							.from('invoices')
							.select('id, paid')
							.in('inscription_id', inscriptionIds)
							.eq('paid', true);

					if (invoicesError) {
						console.error(
							'Error fetching inscription invoices:',
							invoicesError
						);
						setError('Error checking payment status');
						setHasAccess(false);
						setIsLoading(false);
						return;
					}

					if (inscriptionInvoices && inscriptionInvoices.length > 0) {
						hasPaidInvoice = true;
						console.log(
							'User has paid invoices for inscriptions:',
							inscriptionInvoices
						);
					}
				}

				// Even if no inscription was found, check for direct invoices associated with the account
				if (!hasPaidInvoice && congressId) {
					// For congress-specific access, we need to check if there are any paid invoices
					// linked to inscriptions for this specific congress
					const { data: accountInvoices, error: accountInvoicesError } =
						await supabase
							.from('invoices')
							.select(
								`
							id, 
							paid,
							inscription_id,
							inscriptions!inner(congress_id)
						`
							)
							.eq('account_id', account.id)
							.eq('inscriptions.congress_id', congressId)
							.eq('paid', true);

					if (accountInvoicesError) {
						console.error(
							'Error fetching account invoices:',
							accountInvoicesError
						);
						setError('Error checking payment status');
						setHasAccess(false);
						setIsLoading(false);
						return;
					}

					if (accountInvoices && accountInvoices.length > 0) {
						hasPaidInvoice = true;
						console.log(
							'User has paid invoices for this congress:',
							accountInvoices
						);
					}
				} else if (!hasPaidInvoice && !congressId) {
					// For general access, we check if the user has any paid invoice
					const { data: accountInvoices, error: accountInvoicesError } =
						await supabase
							.from('invoices')
							.select('id, paid')
							.eq('account_id', account.id)
							.eq('paid', true);

					if (accountInvoicesError) {
						console.error(
							'Error fetching account invoices:',
							accountInvoicesError
						);
						setError('Error checking payment status');
						setHasAccess(false);
						setIsLoading(false);
						return;
					}

					if (accountInvoices && accountInvoices.length > 0) {
						hasPaidInvoice = true;
						console.log(
							'User has paid invoices directly linked to account:',
							accountInvoices
						);
					}
				}

				// User has access if they have at least one paid invoice
				setHasAccess(hasPaidInvoice);
				setIsLoading(false);
			} catch (err) {
				console.error('Unexpected error in access check:', err);
				setError('An unexpected error occurred');
				setHasAccess(false);
				setIsLoading(false);
			}
		}

		checkAccess();
	}, [isAuthenticated, user, congressId]);

	return { hasAccess, isLoading, error };
}
