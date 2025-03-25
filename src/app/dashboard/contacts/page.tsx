'use client';

import { FeedbackDialog } from '@/components/auth/FeedbackDialog';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import {
	Calendar,
	CheckCircle,
	Loader2,
	Mail,
	MessageSquare,
	RefreshCw,
	Search,
	User,
	XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Contact {
	id: string;
	name: string;
	email: string;
	subject: string;
	message: string;
	status: 'new' | 'read' | 'replied';
	created_at: string;
	updated_at: string | null;
}

export default function ContactsPage() {
	const { t } = useTranslation();
	const [contacts, setContacts] = useState<Contact[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
	const [replyMessage, setReplyMessage] = useState('');
	const [replying, setReplying] = useState(false);
	const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied'>(
		'all'
	);
	const [feedbackDialog, setFeedbackDialog] = useState<{
		isOpen: boolean;
		title: string;
		message: string;
		type: 'success' | 'error' | 'loading';
	}>({
		isOpen: false,
		title: '',
		message: '',
		type: 'loading',
	});

	// Close dialog handler
	const handleCloseDialog = () => {
		setFeedbackDialog((prev) => ({ ...prev, isOpen: false }));
	};

	// Fetch contacts from Supabase
	const fetchContacts = async () => {
		setLoading(true);
		try {
			let query = supabase
				.from('contact')
				.select('*')
				.order('created_at', { ascending: false });

			// Apply filters
			if (filter !== 'all') {
				query = query.eq('status', filter);
			}

			const { data, error } = await query;

			if (error) {
				throw error;
			}

			setContacts(data as Contact[]);
		} catch (error) {
			console.error('Error fetching contacts:', error);
			toast.error('Failed to load contacts');
			setFeedbackDialog({
				isOpen: true,
				title: t('dashboard.contacts.loadError') || 'Load Error',
				message:
					t('dashboard.contacts.loadErrorMessage') ||
					'Failed to load contacts. Please try again.',
				type: 'error',
			});
		} finally {
			setLoading(false);
		}
	};

	// Update contact status
	const updateContactStatus = async (
		id: string,
		status: 'new' | 'read' | 'replied'
	) => {
		// Don't show dialog for automatic "read" status updates
		const isManualUpdate =
			status !== 'read' ||
			(selectedContact && selectedContact.status !== 'new');

		if (isManualUpdate) {
			setFeedbackDialog({
				isOpen: true,
				title: t('dashboard.contacts.updating') || 'Updating Status',
				message:
					t('dashboard.contacts.updatingMessage') ||
					`Marking message as ${status}...`,
				type: 'loading',
			});
		}

		try {
			const { error } = await supabase
				.from('contact')
				.update({
					status,
					updated_at: new Date().toISOString(),
				})
				.eq('id', id);

			if (error) {
				throw error;
			}

			// Update the local state
			setContacts(
				contacts.map((contact) =>
					contact.id === id
						? { ...contact, status, updated_at: new Date().toISOString() }
						: contact
				)
			);

			if (selectedContact && selectedContact.id === id) {
				setSelectedContact({
					...selectedContact,
					status,
					updated_at: new Date().toISOString(),
				});
			}

			if (isManualUpdate) {
				setFeedbackDialog({
					isOpen: true,
					title: t('dashboard.contacts.statusUpdated') || 'Status Updated',
					message:
						t('dashboard.contacts.statusUpdatedMessage') ||
						`Message has been marked as ${status}.`,
					type: 'success',
				});
			}

			toast.success(`Message marked as ${status}`);
		} catch (error) {
			console.error(`Error updating contact status:`, error);

			if (isManualUpdate) {
				setFeedbackDialog({
					isOpen: true,
					title: t('dashboard.contacts.updateError') || 'Update Failed',
					message:
						t('dashboard.contacts.updateErrorMessage') ||
						'Failed to update message status. Please try again.',
					type: 'error',
				});
			}

			toast.error('Failed to update message status');
		}
	};

	// Send reply to contact
	const sendReply = async () => {
		if (!selectedContact) return;
		if (!replyMessage.trim()) {
			toast.error('Please enter a reply message');
			return;
		}

		setReplying(true);
		setFeedbackDialog({
			isOpen: true,
			title: t('dashboard.contacts.sending') || 'Sending Reply',
			message:
				t('dashboard.contacts.sendingMessage') ||
				'Please wait while we send your reply...',
			type: 'loading',
		});

		try {
			// This would be replaced with actual email sending logic
			// For now, we'll just simulate it with a delay and update the status
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Update the contact status to 'replied'
			await updateContactStatus(selectedContact.id, 'replied');

			setFeedbackDialog({
				isOpen: true,
				title: t('dashboard.contacts.replySent') || 'Reply Sent',
				message:
					t('dashboard.contacts.replySentMessage') ||
					'Your reply has been sent successfully.',
				type: 'success',
			});

			toast.success('Reply sent successfully');
			setReplyMessage('');
		} catch (error) {
			console.error('Error sending reply:', error);

			setFeedbackDialog({
				isOpen: true,
				title: t('dashboard.contacts.replyError') || 'Reply Failed',
				message:
					t('dashboard.contacts.replyErrorMessage') ||
					'Failed to send reply. Please try again later.',
				type: 'error',
			});

			toast.error('Failed to send reply');
		} finally {
			setReplying(false);
		}
	};

	// Initial data fetch
	useEffect(() => {
		fetchContacts();
	}, [filter]);

	// Mark as read when a contact is selected
	useEffect(() => {
		if (selectedContact && selectedContact.status === 'new') {
			updateContactStatus(selectedContact.id, 'read');
		}
	}, [selectedContact]);

	// Filter contacts by search query
	const filteredContacts = contacts.filter((contact) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			contact.name.toLowerCase().includes(query) ||
			contact.email.toLowerCase().includes(query) ||
			contact.subject.toLowerCase().includes(query) ||
			contact.message.toLowerCase().includes(query)
		);
	});

	return (
		<div className="h-full">
			{/* Feedback Dialog */}
			<FeedbackDialog
				isOpen={feedbackDialog.isOpen}
				onClose={handleCloseDialog}
				title={feedbackDialog.title}
				message={feedbackDialog.message}
				type={feedbackDialog.type}
			/>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex flex-col h-full">
					<div className="mb-8">
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
							{t('dashboard.contacts.title') || 'Contact Messages'}
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							{t('dashboard.contacts.subtitle') ||
								'View and respond to messages from your website visitors'}
						</p>
					</div>

					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col lg:flex-row flex-1">
						{/* Contact List */}
						<div className="lg:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
							{/* Search and Filters */}
							<div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
								<div className="relative">
									<Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
									<input
										type="text"
										placeholder={
											t('dashboard.contacts.search') || 'Search messages...'
										}
										className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
								</div>

								<div className="flex space-x-2">
									<button
										className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
											filter === 'all'
												? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
												: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
										}`}
										onClick={() => setFilter('all')}
									>
										All
									</button>
									<button
										className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
											filter === 'new'
												? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
												: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
										}`}
										onClick={() => setFilter('new')}
									>
										New
									</button>
									<button
										className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
											filter === 'read'
												? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
												: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
										}`}
										onClick={() => setFilter('read')}
									>
										Read
									</button>
									<button
										className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
											filter === 'replied'
												? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
												: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
										}`}
										onClick={() => setFilter('replied')}
									>
										Replied
									</button>
								</div>
							</div>

							{/* Contact List */}
							<div className="flex-1 overflow-y-auto">
								{loading ? (
									<div className="flex items-center justify-center h-64">
										<Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
									</div>
								) : filteredContacts.length === 0 ? (
									<div className="flex flex-col items-center justify-center h-64 text-center p-4">
										<MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
										<p className="text-gray-500 dark:text-gray-400 mb-2">
											{t('dashboard.contacts.noMessages') ||
												'No messages found'}
										</p>
										<button
											onClick={fetchContacts}
											className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
										>
											<RefreshCw className="h-4 w-4 mr-2" />
											Refresh
										</button>
									</div>
								) : (
									<ul className="divide-y divide-gray-200 dark:divide-gray-700">
										{filteredContacts.map((contact) => (
											<li
												key={contact.id}
												className={`cursor-pointer ${
													selectedContact?.id === contact.id
														? 'bg-blue-50 dark:bg-blue-900/20'
														: 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
												}`}
												onClick={() => setSelectedContact(contact)}
											>
												<div className="px-4 py-4">
													<div className="flex justify-between items-start">
														<h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
															{contact.subject}
														</h3>
														<div className="ml-2 flex-shrink-0">
															{contact.status === 'new' && (
																<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
																	New
																</span>
															)}
															{contact.status === 'read' && (
																<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
																	Read
																</span>
															)}
															{contact.status === 'replied' && (
																<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
																	Replied
																</span>
															)}
														</div>
													</div>
													<div className="flex items-center mt-1">
														<User className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1.5" />
														<p className="text-sm text-gray-600 dark:text-gray-300 truncate">
															{contact.name}
														</p>
													</div>
													<div className="mt-2">
														<p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
															{contact.message}
														</p>
													</div>
													<div className="mt-2 flex justify-between">
														<div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
															<Calendar className="h-3 w-3 mr-1" />
															{formatDistanceToNow(
																new Date(contact.created_at),
																{
																	addSuffix: true,
																}
															)}
														</div>
													</div>
												</div>
											</li>
										))}
									</ul>
								)}
							</div>
						</div>

						{/* Message Details */}
						<div className="lg:w-2/3 flex flex-col">
							{selectedContact ? (
								<div className="flex flex-col h-full">
									{/* Message Header */}
									<div className="p-6 border-b border-gray-200 dark:border-gray-700">
										<div className="flex justify-between items-start mb-4">
											<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
												{selectedContact.subject}
											</h2>
											<div className="flex space-x-2">
												{selectedContact.status !== 'replied' && (
													<button
														onClick={() =>
															updateContactStatus(selectedContact.id, 'replied')
														}
														className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
													>
														<CheckCircle className="h-4 w-4 mr-1.5" />
														Mark as Replied
													</button>
												)}
												<button
													onClick={() => setSelectedContact(null)}
													className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
												>
													<XCircle className="h-4 w-4 mr-1.5" />
													Close
												</button>
											</div>
										</div>
										<div className="flex flex-col sm:flex-row sm:items-center justify-between">
											<div className="flex items-center mb-2 sm:mb-0">
												<div className="flex-shrink-0">
													<div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
														<User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
													</div>
												</div>
												<div className="ml-3">
													<p className="text-sm font-medium text-gray-900 dark:text-white">
														{selectedContact.name}
													</p>
													<p className="text-sm text-gray-500 dark:text-gray-400">
														{selectedContact.email}
													</p>
												</div>
											</div>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												{new Date(selectedContact.created_at).toLocaleString()}
											</p>
										</div>
									</div>

									{/* Message Content */}
									<div className="p-6 flex-1 overflow-y-auto">
										<div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
											<p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
												{selectedContact.message}
											</p>
										</div>
									</div>

									{/* Reply Section */}
									<div className="p-6 border-t border-gray-200 dark:border-gray-700">
										<h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
											{t('dashboard.contacts.reply') || 'Reply to this message'}
										</h3>
										<div className="mb-3">
											<textarea
												className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
												rows={4}
												placeholder="Type your reply here..."
												value={replyMessage}
												onChange={(e) => setReplyMessage(e.target.value)}
											/>
										</div>
										<div className="flex justify-end">
											<button
												type="button"
												className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
												onClick={sendReply}
												disabled={replying || !replyMessage.trim()}
											>
												{replying ? (
													<>
														<Loader2 className="animate-spin mr-2 h-4 w-4" />
														Sending...
													</>
												) : (
													<>
														<Mail className="mr-2 h-4 w-4" />
														Send Reply
													</>
												)}
											</button>
										</div>
									</div>
								</div>
							) : (
								<div className="flex flex-col items-center justify-center h-full text-center p-8">
									<MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
									<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
										{t('dashboard.contacts.noMessageSelected') ||
											'No Message Selected'}
									</h3>
									<p className="text-gray-500 dark:text-gray-400 max-w-md">
										{t('dashboard.contacts.selectMessage') ||
											'Select a message from the list to view its details and reply.'}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
