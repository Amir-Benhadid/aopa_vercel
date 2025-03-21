'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	return (
		<div className="min-h-screen w-full overflow-hidden">
			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={pathname}
					initial={{ y: 10, scale: 0.98, opacity: 0 }}
					animate={{ y: 0, scale: 1, opacity: 1 }}
					exit={{ y: -10, scale: 0.98, opacity: 0 }}
					transition={{
						type: 'spring',
						stiffness: 120,
						damping: 15,
						duration: 0.4,
					}}
					className="min-h-screen w-full"
				>
					{children}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
