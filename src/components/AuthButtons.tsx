'use client';

import { useAuth } from '@/providers/AuthProvider';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';

export function AuthButtons() {
	const { user, logout } = useAuth();
	const router = useRouter();
	const { t } = useTranslation();

	if (user) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
			>
				<Button
					variant="ghost"
					onClick={logout}
					className="text-card-foreground hover:text-primary-500"
					translationKey="auth.signOut"
				/>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="flex gap-4"
		>
			<Button
				variant="ghost"
				className="text-card-foreground hover:text-primary-500"
				onClick={() => router.push('/auth?mode=login')}
				translationKey="auth.signIn"
			/>
			<Button
				className="bg-primary-500 text-white hover:bg-primary-600"
				onClick={() => router.push('/auth?mode=signup')}
				translationKey="auth.signUp"
			/>
		</motion.div>
	);
}
