'use client';

import { useCallback, useState } from 'react';

type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastOptions {
	title: string;
	description: string;
	variant?: ToastVariant;
	duration?: number;
}

export function useToast() {
	const [isVisible, setIsVisible] = useState(false);
	const [toastData, setToastData] = useState<ToastOptions | null>(null);

	const toast = useCallback((options: ToastOptions) => {
		setToastData(options);
		setIsVisible(true);

		setTimeout(() => {
			setIsVisible(false);
			setTimeout(() => setToastData(null), 300); // Clear after fade out
		}, options.duration || 3000);
	}, []);

	return {
		toast,
		isVisible,
		toastData,
	};
}
