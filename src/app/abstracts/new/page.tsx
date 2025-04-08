'use client';

import { CongressHero } from '@/components/home/CongressHero';
import { ProfileSetupModal } from '@/components/profile/ProfileSetupModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Textarea } from '@/components/ui/Textarea';
import {
	getCongressThemes,
	getUpcomingCongress,
	submitAbstract,
	updateAbstract,
} from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { getAbstractById } from '@/services/abstracts';
import { Dialog, Transition } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { Field, Form, Formik } from 'formik';
import {
	AlertCircle,
	ArrowLeft,
	CheckCircle,
	Info,
	Loader2,
	Save,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, {
	Fragment,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as Yup from 'yup';

// Custom form field component with error handling
const FormField = ({ label, name, as: Component = Input, ...props }: any) => (
	<Field name={name}>
		{({ field, meta }: any) => (
			<div className="space-y-1">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<label
							className={`text-sm font-medium ${
								meta.touched && meta.error
									? 'text-red-500 dark:text-red-400'
									: 'text-gray-700 dark:text-gray-200'
							}`}
						>
							{label}
						</label>
						{meta.touched && meta.error && (
							<span className="text-sm text-red-500 dark:text-red-400">
								({meta.error})
							</span>
						)}
					</div>
				</div>
				<Component
					{...field}
					{...props}
					className={`${props.className || ''} ${
						meta.touched && meta.error
							? 'border-red-500 focus:ring-red-500'
							: ''
					}`}
				/>
			</div>
		)}
	</Field>
);

export default function NewAbstractPage() {
	const { user } = useAuth();
	const router = useRouter();
	const [showErrorDialog, setShowErrorDialog] = useState(false);
	const [showSuccessDialog, setShowSuccessDialog] = useState(false);
	const [showProfileSetup, setShowProfileSetup] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [isDraftSubmitting, setIsDraftSubmitting] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [existingAbstractId, setExistingAbstractId] = useState<string | null>(
		null
	);
	const [existingAbstractData, setExistingAbstractData] = useState<any>(null);
	const [isLoadingExistingAbstract, setIsLoadingExistingAbstract] =
		useState(false);
	const { t } = useTranslation();

	// SearchParamsHandler component that uses useSearchParams
	const SearchParamsHandler = React.memo(
		function SearchParamsHandler({
			onEditMode,
		}: {
			onEditMode: (id: string | null) => void;
		}) {
			const searchParams = useSearchParams();
			const editId = searchParams.get('edit');
			const editIdRef = useRef(editId);
			const hasProcessedRef = useRef(false);

			useEffect(() => {
				// Only process if editId changed or we haven't processed it yet
				if (editIdRef.current !== editId || !hasProcessedRef.current) {
					console.log('Search params processing, edit ID:', editId);
					editIdRef.current = editId;
					hasProcessedRef.current = true;
					onEditMode(editId);
				}
			}, [editId, onEditMode]);

			return null;
		},
		(prevProps, nextProps) => {
			// Custom comparison function to prevent unnecessary re-renders
			// Only re-render if the onEditMode function reference changes
			return prevProps.onEditMode === nextProps.onEditMode;
		}
	);

	// Fonction pour charger les données d'un abstract existant - memoize with useCallback
	const loadExistingAbstract = useCallback(
		async (abstractId: string) => {
			// If we're already loading or have already loaded this abstract, don't reload
			if (
				isLoadingExistingAbstract ||
				(existingAbstractData && existingAbstractId === abstractId)
			) {
				return;
			}

			try {
				setIsLoadingExistingAbstract(true);
				console.log('Loading abstract with ID:', abstractId);

				const abstract = await getAbstractById(abstractId);

				if (abstract) {
					setExistingAbstractData(abstract);
					console.log('Abstract data loaded successfully');
				} else {
					console.log('Abstract not found');
					toast.error(t('abstracts.error.abstractNotFound'));
					router.push('/abstracts');
				}
			} catch (error) {
				console.error('Error loading existing abstract:', error);
				toast.error(t('abstracts.error.abstractNotFound'));
			} finally {
				setIsLoadingExistingAbstract(false);
			}
		},
		[
			router,
			t,
			isLoadingExistingAbstract,
			existingAbstractData,
			existingAbstractId,
		]
	);

	// Handle edit mode from search params - use useCallback to stabilize the function reference
	const handleEditMode = useCallback(
		(editId: string | null) => {
			console.log('Edit mode handler called with:', editId);

			// Don't make unnecessary updates if we're already in the right state
			if (editId) {
				if (editMode && existingAbstractId === editId) {
					return; // Already in edit mode with the same ID
				}

				// Set all states in one go to minimize renders
				setEditMode(true);
				setExistingAbstractId(editId);

				// Only load the abstract if we don't already have it
				if (existingAbstractId !== editId) {
					loadExistingAbstract(editId);
				}
			} else if (editMode) {
				// Only update if we need to change the mode
				setEditMode(false);
				setExistingAbstractId(null);
				setExistingAbstractData(null);
			}
		},
		[loadExistingAbstract, editMode, existingAbstractId]
	);

	const abstractSchema = useMemo(
		() =>
			Yup.object().shape({
				title: Yup.string().required(
					t('abstracts.submission.error.titleRequired')
				),
				introduction: Yup.string().required(
					t('abstracts.submission.error.introductionRequired')
				),
				materials: Yup.string().required(
					t('abstracts.submission.error.materialsRequired')
				),
				results: Yup.string().required(
					t('abstracts.submission.error.resultsRequired')
				),
				conclusion: Yup.string().required(
					t('abstracts.submission.error.conclusionRequired')
				),
				discussion: Yup.string(),
				type: Yup.string()
					.oneOf(['poster', 'oral'])
					.required(t('abstracts.submission.error.typeRequired')),
				theme: Yup.string().required(
					t('abstracts.submission.error.themeRequired')
				),
				coAuthors: Yup.string(),
			}),
		[t]
	);

	// Schéma de validation pour le mode brouillon (sans validation des champs requis)
	const draftSchema = useMemo(
		() =>
			Yup.object().shape({
				title: Yup.string(),
				introduction: Yup.string(),
				materials: Yup.string(),
				results: Yup.string(),
				conclusion: Yup.string(),
				discussion: Yup.string(),
				type: Yup.string().oneOf(['poster', 'oral']),
				theme: Yup.string(),
				coAuthors: Yup.string(),
			}),
		[]
	);

	const initialValues = useMemo(() => {
		// Si nous sommes en mode édition et que nous avons les données de l'abstract existant
		if (editMode && existingAbstractData) {
			return {
				title: existingAbstractData.title || '',
				introduction: existingAbstractData.introduction || '',
				materials: existingAbstractData.materials || '',
				results: existingAbstractData.results || '',
				conclusion: existingAbstractData.conclusion || '',
				discussion: existingAbstractData.discussion || '',
				type: existingAbstractData.type || 'poster',
				theme: existingAbstractData.theme || '',
				coAuthors: existingAbstractData.co_authors
					? Array.isArray(existingAbstractData.co_authors)
						? existingAbstractData.co_authors.join(', ')
						: ''
					: '',
			};
		}

		// Valeurs par défaut pour un nouvel abstract
		return {
			title: '',
			introduction: '',
			materials: '',
			results: '',
			conclusion: '',
			discussion: '',
			type: 'poster',
			theme: '',
			coAuthors: '',
		};
	}, [editMode, existingAbstractData]);

	const {
		data: activeCongress,
		isLoading: isLoadingCongress,
		error: congressError,
	} = useQuery({
		queryKey: ['upcomingCongress'],
		queryFn: getUpcomingCongress,
		staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
		gcTime: 1000 * 60 * 30, // Keep in garbage collection for 30 minutes
		retry: 2, // Retry failed requests twice
	});

	// Fetch congress themes
	const {
		data: themes,
		isLoading: isLoadingThemes,
		error: themesError,
	} = useQuery({
		queryKey: ['congressThemes', activeCongress?.id],
		queryFn: () => (activeCongress ? getCongressThemes() : Promise.resolve([])),
		enabled: !!activeCongress,
		staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
		gcTime: 1000 * 60 * 30, // Keep in garbage collection for 30 minutes
		retry: 2, // Retry failed requests twice
	});

	const handleSubmit = async (
		values: typeof initialValues,
		{ setSubmitting }: any,
		isDraft: boolean = false
	) => {
		try {
			if (!user) {
				setErrorMessage(t('abstracts.submission.error.notLoggedIn'));
				setShowErrorDialog(true);
				return;
			}

			if (!activeCongress) {
				setErrorMessage(t('abstracts.submission.error.noActiveCongress'));
				setShowErrorDialog(true);
				return;
			}

			// Validation des données selon le mode (brouillon ou soumission complète)
			if (isDraft) {
				// Pour le mode brouillon, on utilise draftSchema qui n'a pas de validation required
				const isValid = await draftSchema.validate(values).catch(() => false);
				if (isValid === false) {
					throw new Error(t('abstracts.submission.error.draftSaveFailed'));
				}
			} else {
				// Pour la soumission complète, on utilise abstractSchema avec validation required
				const isValid = await abstractSchema
					.validate(values)
					.catch(() => false);
				if (isValid === false) {
					throw new Error(t('abstracts.submission.error.submitFailed'));
				}
			}

			// Préparer les données de l'abstract
			const abstractData = {
				title: values.title,
				introduction: values.introduction,
				materials: values.materials,
				results: values.results,
				discussion: values.discussion,
				conclusion: values.conclusion,
				type: values.type as 'poster' | 'oral',
				theme: values.theme,
				co_authors: values.coAuthors
					.split(',')
					.map((author: string) => author.trim())
					.filter(Boolean),
			};

			let updatedAbstract;

			// Si nous sommes en mode édition, mettre à jour l'abstract existant
			if (editMode && existingAbstractId) {
				updatedAbstract = await updateAbstract(existingAbstractId, {
					...abstractData,
					status: isDraft ? 'draft' : 'submitted',
				});
			} else {
				// Sinon, créer un nouvel abstract
				updatedAbstract = await submitAbstract(
					abstractData,
					activeCongress.id,
					user.id,
					user.email,
					isDraft ? 'draft' : 'submitted'
				);
			}

			// Afficher un message différent si c'est un brouillon
			if (isDraft) {
				// Montrer un message de succès pour le brouillon
				toast.success(t('abstracts.success.draftSaved'));

				// Rediriger vers la liste des abstracts
				router.push('/abstracts');
			} else {
				// Pour une soumission complète, continuer comme avant
				// Set flag in localStorage to indicate a new abstract was submitted
				localStorage.setItem('newAbstractSubmitted', 'true');

				// Show success dialog
				setShowSuccessDialog(true);
			}
		} catch (error: any) {
			console.error('Error submitting abstract:', error);
			if (error.name === 'INCOMPLETE_PROFILE') {
				setShowProfileSetup(true);
			} else {
				setErrorMessage(
					isDraft
						? t('abstracts.submission.error.draftSaveFailed')
						: t('abstracts.submission.error.submitFailed')
				);
				setShowErrorDialog(true);
			}
		} finally {
			setSubmitting(false);
			if (isDraft) {
				setIsDraftSubmitting(false);
			}
		}
	};

	const handleSaveDraft = async (
		values: typeof initialValues,
		formikBag: any
	) => {
		setIsDraftSubmitting(true);
		// Ne pas valider avec validateForm, on laisse handleSubmit gérer la validation
		await handleSubmit(values, formikBag, true);
	};

	// Combinaison de tous les états de chargement
	const isLoading =
		isLoadingCongress || isLoadingThemes || isLoadingExistingAbstract;

	if (isLoading) {
		return (
			<LoadingSpinner
				message={
					isLoadingExistingAbstract
						? t(
								'abstracts.loading.existingAbstract',
								'Loading abstract data...'
						  )
						: t(
								'abstracts.submission.loading',
								'Loading abstract submission form...'
						  )
				}
				background="white"
				size="default"
				fullScreen={true}
			/>
		);
	}

	if (congressError) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-3xl mx-auto">
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
						<div className="flex items-start gap-4">
							<AlertCircle className="w-6 h-6 text-red-500 mt-1" />
							<div>
								<h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
									{t('abstracts.submission.error.loadingCongress')}
								</h3>
								<p className="mt-2 text-red-700 dark:text-red-300">
									{t('abstracts.submission.error.reloadLater')}
								</p>
								<Button
									onClick={() => router.back()}
									variant="outline"
									className="mt-4"
								>
									{t('common.goBack')}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!activeCongress) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-3xl mx-auto">
					<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
						<div className="flex items-start gap-4">
							<Info className="w-6 h-6 text-yellow-500 mt-1" />
							<div>
								<h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
									{t('abstracts.submission.error.noActiveCongress')}
								</h3>
								<p className="mt-2 text-yellow-700 dark:text-yellow-300">
									{t('abstracts.submission.error.noActiveCongressMessage')}
								</p>
								<Button
									onClick={() => router.back()}
									variant="outline"
									className="mt-4"
								>
									{t('common.goBack')}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<Suspense
				fallback={
					<LoadingSpinner
						message={t('common.loading')}
						background="white"
						size="default"
						fullScreen={true}
					/>
				}
			>
				<SearchParamsHandler onEditMode={handleEditMode} />
			</Suspense>
			<div className="max-w-3xl mx-auto">
				<div className="flex items-center gap-4 mb-8">
					<Button variant="ghost" className="p-2" onClick={() => router.back()}>
						<ArrowLeft className="w-5 h-5" />
					</Button>
					<div>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
							{editMode
								? t('abstracts.submission.editTitle', 'Edit Abstract')
								: t('abstracts.submission.title', 'Submit New Abstract')}
						</h1>
						<p className="mt-2 text-gray-600 dark:text-gray-400">
							{editMode
								? t('abstracts.submission.editSubtitle', 'Update your abstract')
								: t(
										'abstracts.submission.subtitle',
										'Fill in the details below to submit your abstract'
								  )}
						</p>
					</div>
				</div>

				{/* Congress Information Section */}
				{activeCongress && (
					<div className="mb-8">
						<CongressHero congress={activeCongress} />
					</div>
				)}

				{/* Submission Guidelines Section */}
				<div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm border border-blue-100 dark:border-blue-800 p-6 mb-8">
					<div className="flex items-start gap-4">
						<div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
							<Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
						</div>
						<div className="flex-1 space-y-4">
							<div>
								<h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
									{t('abstracts.submission.guidelines.title')}
								</h2>
								<p className="mt-1 text-blue-700 dark:text-blue-300">
									{t('abstracts.submission.guidelines.subtitle')}
								</p>
							</div>

							<div className="space-y-3">
								<ul className="pl-6 space-y-2 text-blue-600 dark:text-blue-400 list-disc list-inside">
									<li>{t('abstracts.submission.guidelines.maxLength')}</li>
									<li>
										{t('abstracts.submission.guidelines.deadline', {
											date: activeCongress?.abstract_submission_deadline
												? new Date(
														activeCongress.abstract_submission_deadline
												  ).toLocaleDateString()
												: t('common.unknown'),
										})}
									</li>
									<li>
										{t('abstracts.submission.guidelines.presentingAuthor')}
									</li>
									<li>{t('abstracts.submission.guidelines.maxSubmissions')}</li>
									<li>{t('abstracts.submission.guidelines.requiredFields')}</li>
									<li>{t('abstracts.submission.guidelines.review')}</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

				<Formik
					initialValues={initialValues}
					validationSchema={abstractSchema}
					onSubmit={handleSubmit}
					enableReinitialize={true}
					key={existingAbstractId || 'new'}
				>
					{({
						isSubmitting,
						values,
						setFieldTouched,
						validateForm,
						errors,
						setSubmitting,
					}) => (
						<Form className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
							<div className="space-y-6">
								{/* Type Selection */}
								<div className="space-y-1">
									<Field name="type">
										{({ field, meta }: any) => (
											<>
												<div className="flex items-center gap-2">
													<label
														className={`text-sm font-medium ${
															meta.touched && meta.error
																? 'text-red-500 dark:text-red-400'
																: 'text-gray-700 dark:text-gray-200'
														}`}
													>
														{t('abstracts.submission.form.type')}
													</label>
													{meta.touched && meta.error && (
														<span className="text-sm text-red-500 dark:text-red-400">
															({meta.error})
														</span>
													)}
												</div>
												<div className="flex gap-4 mt-2 justify-around">
													<label className="flex items-center space-x-2 cursor-pointer">
														<div className="relative">
															<input
																type="radio"
																name="type"
																value="poster"
																checked={field.value === 'poster'}
																onChange={field.onChange}
																className="sr-only"
															/>
															<div
																className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center
																${
																	field.value === 'poster'
																		? 'border-green-500 bg-green-50 dark:bg-green-900/20'
																		: 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700'
																}
															`}
															>
																{field.value === 'poster' && (
																	<svg
																		className="w-5 h-5 text-green-500 animate-checkmark"
																		viewBox="0 0 24 24"
																		fill="none"
																		stroke="currentColor"
																		strokeWidth="2"
																		strokeLinecap="round"
																		strokeLinejoin="round"
																	>
																		<path d="M20 6L9 17l-5-5" />
																	</svg>
																)}
															</div>
														</div>
														<span className="text-sm font-medium">
															{t('abstracts.types.poster')}
														</span>
													</label>

													<label className="flex items-center space-x-2 cursor-pointer">
														<div className="relative">
															<input
																type="radio"
																name="type"
																value="oral"
																checked={field.value === 'oral'}
																onChange={field.onChange}
																className="sr-only"
															/>
															<div
																className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center
																${
																	field.value === 'oral'
																		? 'border-green-500 bg-green-50 dark:bg-green-900/20'
																		: 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700'
																}
															`}
															>
																{field.value === 'oral' && (
																	<svg
																		className="w-5 h-5 text-green-500 animate-checkmark"
																		viewBox="0 0 24 24"
																		fill="none"
																		stroke="currentColor"
																		strokeWidth="2"
																		strokeLinecap="round"
																		strokeLinejoin="round"
																	>
																		<path d="M20 6L9 17l-5-5" />
																	</svg>
																)}
															</div>
														</div>
														<span className="text-sm font-medium">
															{t('abstracts.types.oral')}
														</span>
													</label>
												</div>
											</>
										)}
									</Field>
								</div>

								{/* Title */}
								<FormField
									label={t('abstracts.submission.form.title')}
									name="title"
									placeholder={t('abstracts.submission.form.titlePlaceholder')}
								/>

								{/* Theme - Updated to use select instead of input */}
								<Field name="theme">
									{({ field, meta }: any) => (
										<div className="space-y-1">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<label
														className={`text-sm font-medium ${
															meta.touched && meta.error
																? 'text-red-500 dark:text-red-400'
																: 'text-gray-700 dark:text-gray-200'
														}`}
													>
														{t('abstracts.submission.form.theme')}
													</label>
													{meta.touched && meta.error && (
														<span className="text-sm text-red-500 dark:text-red-400">
															({meta.error})
														</span>
													)}
												</div>
											</div>
											<select
												{...field}
												className={`w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 ${
													meta.touched && meta.error
														? 'border-red-500 focus:ring-red-500'
														: 'focus:border-blue-500 focus:ring-blue-500'
												}`}
											>
												<option value="">
													{t('abstracts.submission.form.selectTheme')}
												</option>
												{themes &&
													themes.map((theme, index) => (
														<option key={index} value={theme}>
															{theme}
														</option>
													))}
											</select>
										</div>
									)}
								</Field>

								{/* Co-Authors */}
								<FormField
									label={t('abstracts.submission.form.coAuthors')}
									name="coAuthors"
									placeholder={t(
										'abstracts.submission.form.coAuthorsPlaceholder'
									)}
								/>

								{/* Introduction */}
								<FormField
									label={t('abstracts.submission.form.introduction')}
									name="introduction"
									as={Textarea}
									rows={4}
									placeholder={t(
										'abstracts.submission.form.introductionPlaceholder'
									)}
								/>

								{/* Materials */}
								<FormField
									label={t('abstracts.submission.form.materials')}
									name="materials"
									as={Textarea}
									rows={4}
									placeholder={t(
										'abstracts.submission.form.materialsPlaceholder'
									)}
								/>

								{/* Results */}
								<FormField
									label={t('abstracts.submission.form.results')}
									name="results"
									as={Textarea}
									rows={4}
									placeholder={t(
										'abstracts.submission.form.resultsPlaceholder'
									)}
								/>

								{/* Discussion */}
								<FormField
									label={t('abstracts.submission.form.discussion')}
									name="discussion"
									as={Textarea}
									rows={4}
									placeholder={t(
										'abstracts.submission.form.discussionPlaceholder'
									)}
								/>

								{/* Conclusion */}
								<FormField
									label={t('abstracts.submission.form.conclusion')}
									name="conclusion"
									as={Textarea}
									rows={4}
									placeholder={t(
										'abstracts.submission.form.conclusionPlaceholder'
									)}
								/>

								<div className="flex justify-end space-x-3 pt-6">
									<Button
										type="button"
										variant="outline"
										onClick={() => router.back()}
										disabled={isSubmitting || isDraftSubmitting}
										className="flex items-center gap-2"
									>
										{t('common.cancel')}
									</Button>

									<Button
										type="button"
										variant="outline"
										onClick={() => {
											// Pas besoin de valider avant d'appeler handleSaveDraft
											// La validation sera faite dans handleSubmit avec draftSchema
											handleSaveDraft(values, { setSubmitting });
										}}
										disabled={isSubmitting || isDraftSubmitting}
										className="flex items-center gap-2"
									>
										{isDraftSubmitting ? (
											<>
												<Loader2 className="w-4 h-4 animate-spin" />
												{t('abstracts.submission.form.savingDraft')}
											</>
										) : (
											<>
												<Save className="w-4 h-4" />
												{t('abstracts.submission.form.saveDraft')}
											</>
										)}
									</Button>

									<Button
										type="submit"
										disabled={isSubmitting || isDraftSubmitting}
										className="flex items-center gap-2"
									>
										{isSubmitting ? (
											<>
												<Loader2 className="w-4 h-4 animate-spin" />
												{t('abstracts.submission.form.submitting')}
											</>
										) : (
											t('abstracts.submission.form.submit')
										)}
									</Button>
								</div>
							</div>
						</Form>
					)}
				</Formik>
			</div>

			{/* Error Dialog */}
			<Transition appear show={showErrorDialog} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-50"
					onClose={() => setShowErrorDialog(false)}
				>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
									<div className="flex items-start">
										<div className="flex-shrink-0">
											<AlertCircle
												className="h-6 w-6 text-red-500"
												aria-hidden="true"
											/>
										</div>
										<div className="ml-3">
											<Dialog.Title
												as="h3"
												className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
											>
												{t('abstracts.error.title')}
											</Dialog.Title>
											<div className="mt-2">
												<p className="text-sm text-gray-500 dark:text-gray-400">
													{errorMessage}
												</p>
											</div>
										</div>
									</div>
									<div className="mt-4 flex justify-end">
										<Button
											type="button"
											onClick={() => setShowErrorDialog(false)}
										>
											{t('common.ok')}
										</Button>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>

			{/* Success Dialog */}
			<Transition appear show={showSuccessDialog} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-50"
					onClose={() => {
						setShowSuccessDialog(false);
						router.push('/abstracts');
					}}
				>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
									<div className="flex items-start">
										<div className="flex-shrink-0">
											<CheckCircle
												className="h-6 w-6 text-green-500"
												aria-hidden="true"
											/>
										</div>
										<div className="ml-3">
											<Dialog.Title
												as="h3"
												className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
											>
												{t('abstracts.success.title')}
											</Dialog.Title>
											<div className="mt-2">
												<p className="text-sm text-gray-500 dark:text-gray-400">
													{t('abstracts.success.message')}
												</p>
											</div>
										</div>
									</div>
									<div className="mt-4 flex justify-end">
										<Button
											type="button"
											onClick={() => {
												setShowSuccessDialog(false);
												router.push('/abstracts');
											}}
										>
											{t('abstracts.success.viewAbstracts')}
										</Button>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>

			{/* Profile Modal */}
			<ProfileSetupModal
				forceOpen={showProfileSetup}
				onComplete={() => {
					setShowProfileSetup(false);
				}}
			/>
		</div>
	);
}
