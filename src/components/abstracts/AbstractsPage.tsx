'use client';

import AbstractCard from '@/components/abstracts/AbstractCard';
import { AbstractCardSkeleton } from '@/components/abstracts/AbstractCardSkeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Select } from '@/components/ui/select';
import { useAbstracts } from '@/hooks/useAbstracts';
import { useEqualHeight } from '@/hooks/useEqualHeight';
import { useAuth } from '@/providers/AuthProvider';
import { Abstract } from '@/types/database';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, PlusIcon, SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.05,
			staggerDirection: 1,
		},
	},
};

const item = {
	hidden: {
		opacity: 0,
		y: 60,
		scale: 0.9,
	},
	show: (index: number) => ({
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			duration: 0.4,
			ease: [0.25, 0.1, 0.25, 1],
			delay: (index % 3) * 0.1,
		},
	}),
	exit: (index: number) => ({
		opacity: 0,
		y: 30,
		scale: 0.9,
		transition: {
			duration: 0.3,
			ease: 'easeInOut',
			delay: (index % 3) * 0.05,
		},
	}),
};

export function AbstractsPage() {
	const { user, isLoading: isAuthLoading } = useAuth();
	const { t } = useTranslation();

	const {
		abstracts,
		congresses,
		isLoading: isAbstractsLoading,
		isFetching,
		isError,
		searchTerm,
		setSearchTerm,
		statusFilter,
		setStatusFilter,
		typeFilter,
		setTypeFilter,
		congressFilter,
		setCongressFilter,
		refetch,
	} = useAbstracts(user?.id);

	const gridRef = useEqualHeight();

	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const router = useRouter();

	// Add effect to check for newly submitted abstract and trigger refetch
	useEffect(() => {
		// Check if there's a flag indicating a new abstract was submitted
		const hasNewAbstract = localStorage.getItem('newAbstractSubmitted');

		if (hasNewAbstract === 'true' && user?.id) {
			console.log('New abstract detected, triggering refetch');
			// Clear the flag
			localStorage.removeItem('newAbstractSubmitted');
			// Refetch abstracts
			refetch();
		}
	}, [refetch, user?.id]);

	// Log the congresses data for debugging
	useEffect(() => {
		console.log('Abstracts page received congresses:', congresses);
	}, [congresses]);

	const handleSearch = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setSearchTerm(e.target.value);
		},
		[setSearchTerm]
	);

	const handleStatusFilterChange = useCallback((value: string) => {
		setStatusFilter(value);
	}, []);

	const handleTypeFilterChange = useCallback((value: string) => {
		setTypeFilter(value);
	}, []);

	const handleCongressFilterChange = useCallback((value: string) => {
		setCongressFilter(value);
	}, []);

	const memoizedAbstracts = useMemo(() => {
		if (!abstracts) return null;
		return abstracts.map((abstract: Abstract, index: number) => (
			<motion.div
				key={abstract.id}
				variants={item}
				custom={index}
				initial="hidden"
				animate="show"
				exit="exit"
				className="flex"
			>
				<AbstractCard abstract={abstract} />
			</motion.div>
		));
	}, [abstracts]);

	useEffect(() => {
		if (!isAbstractsLoading && isInitialLoad) {
			setIsInitialLoad(false);
		}
	}, [isAbstractsLoading, isInitialLoad]);

	// Show loading state if auth is still loading
	if (isAuthLoading) {
		return (
			<LoadingSpinner
				message={t('abstracts.loading', 'Loading abstracts...')}
				background="white"
				size="default"
				fullScreen={false}
			/>
		);
	}

	return (
		<div className="container mx-auto py-8">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
				<h1 className="text-3xl font-bold">{t('abstracts.title')}</h1>
				<Button
					onClick={() => router.push('/abstracts/new')}
					className="flex items-center gap-2"
				>
					<PlusIcon className="w-4 h-4" />
					{t('abstracts.newAbstract')}
				</Button>
			</div>

			{/* Filters Section */}
			<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Search Input */}
					<div className="flex-1 relative">
						<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
						<Input
							type="text"
							placeholder={t('abstracts.search')}
							value={searchTerm}
							onChange={handleSearch}
							className="pl-10"
						/>
					</div>

					{/* Congress Filter */}
					<div className="w-full md:w-48">
						<Select
							value={congressFilter}
							onValueChange={handleCongressFilterChange}
							options={[
								{
									value: 'all',
									label: t(
										'abstracts.filters.allCongresses',
										'All congresses (2025+)'
									),
								},
								...(congresses?.map((congress) => ({
									value: congress.id,
									label: congress.name,
								})) || []),
							]}
						/>
					</div>

					{/* Status Filter */}
					<div className="w-full md:w-48">
						<Select
							value={statusFilter}
							onValueChange={handleStatusFilterChange}
							options={[
								{ value: 'all', label: t('abstracts.filters.allStatuses') },
								{ value: 'draft', label: t('abstracts.filters.draft') },
								{ value: 'submitted', label: t('abstracts.filters.submitted') },
								{ value: 'reviewing', label: t('abstracts.filters.reviewing') },
								{ value: 'approved', label: t('abstracts.filters.approved') },
								{ value: 'rejected', label: t('abstracts.filters.rejected') },
								{
									value: 'type-change',
									label: t('abstracts.filters.typeChange'),
								},
								{
									value: 'final-version',
									label: t('abstracts.filters.finalVersion'),
								},
							]}
						/>
					</div>

					{/* Type Filter */}
					<div className="w-full md:w-48">
						<Select
							value={typeFilter}
							onValueChange={handleTypeFilterChange}
							options={[
								{ value: 'all', label: t('abstracts.filters.allTypes') },
								{ value: 'poster', label: t('abstracts.filters.poster') },
								{ value: 'oral', label: t('abstracts.filters.oral') },
							]}
						/>
					</div>
				</div>
			</div>

			{/* Loading State with Skeletons */}
			{isAbstractsLoading && isInitialLoad && (
				<motion.div
					variants={container}
					initial="hidden"
					animate="show"
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{Array.from({ length: 6 }).map((_, index) => (
						<motion.div key={index} variants={item} custom={index}>
							<AbstractCardSkeleton />
						</motion.div>
					))}
				</motion.div>
			)}

			{/* Error State */}
			{isError && (
				<div className="text-center py-12">
					<p className="text-red-600 dark:text-red-400">
						Error loading abstracts. Please try again later.
					</p>
				</div>
			)}

			{/* Results Grid */}
			{!isAbstractsLoading && !isError && (
				<motion.div
					ref={gridRef}
					variants={container}
					initial="hidden"
					animate="show"
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					<AnimatePresence mode="sync">
						{abstracts?.length === 0 ? (
							<motion.div
								key="no-results"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}
								className="col-span-full text-center py-12"
							>
								<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
									<FileText className="w-8 h-8 text-gray-500 dark:text-gray-400" />
								</div>
								<h3 className="text-lg font-medium mb-2">
									{t('abstracts.noAbstracts')}
								</h3>
								<Button
									onClick={() => router.push('/abstracts/new')}
									variant="outline"
									className="mt-2"
								>
									{t('abstracts.newAbstract')}
								</Button>
							</motion.div>
						) : (
							memoizedAbstracts
						)}
					</AnimatePresence>
				</motion.div>
			)}
		</div>
	);
}
