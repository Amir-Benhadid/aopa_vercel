'use client';

import { Button } from '@/components/ui/Button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { Textarea } from '@/components/ui/Textarea';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface NewAbstractModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: {
		title: string;
		introduction: string;
		type: 'poster' | 'oral';
		theme: string;
		coAuthors: string[];
	}) => void;
}

export function NewAbstractModal({
	isOpen,
	onClose,
	onSubmit,
}: NewAbstractModalProps) {
	const { t } = useTranslation();
	const [title, setTitle] = useState('');
	const [introduction, setIntroduction] = useState('');
	const [type, setType] = useState<'poster' | 'oral'>('poster');
	const [theme, setTheme] = useState('');
	const [coAuthors, setCoAuthors] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({
			title,
			introduction,
			type,
			theme,
			coAuthors: coAuthors.split(',').map((author) => author.trim()),
		});
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>{t('abstracts.submission.title')}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-1">
								{t('abstracts.submission.form.title')}
							</label>
							<Input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder={t('abstracts.submission.form.titlePlaceholder')}
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">
								{t('abstracts.submission.form.introduction')}
							</label>
							<Textarea
								value={introduction}
								onChange={(e) => setIntroduction(e.target.value)}
								placeholder={t(
									'abstracts.submission.form.introductionPlaceholder'
								)}
								required
								rows={4}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">
								{t('abstracts.submission.form.type')}
							</label>
							<RadioGroup
								value={type}
								onValueChange={(value) => setType(value as 'poster' | 'oral')}
								className="flex gap-4"
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="poster" id="poster" />
									<label
										htmlFor="poster"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										{t('abstracts.filters.poster')}
									</label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="oral" id="oral" />
									<label
										htmlFor="oral"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										{t('abstracts.filters.oral')}
									</label>
								</div>
							</RadioGroup>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">
								{t('abstracts.submission.form.theme')}
							</label>
							<Input
								value={theme}
								onChange={(e) => setTheme(e.target.value)}
								placeholder={t('abstracts.submission.form.themePlaceholder')}
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">
								{t('abstracts.submission.form.coAuthors')}
							</label>
							<Input
								value={coAuthors}
								onChange={(e) => setCoAuthors(e.target.value)}
								placeholder={t(
									'abstracts.submission.form.coAuthorsPlaceholder'
								)}
							/>
						</div>
					</div>

					<div className="flex justify-end space-x-3">
						<Button type="button" variant="outline" onClick={onClose}>
							{t('common.cancel')}
						</Button>
						<Button type="submit">
							{t('abstracts.submission.form.submit')}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
