'use client';

import { HTMLMotionProps, motion, useInView, Variants } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface AnimatedSectionProps extends HTMLMotionProps<'div'> {
	children: ReactNode;
	delay?: number;
	className?: string;
}

export function AnimatedSection({
	children,
	delay = 0,
	className = '',
	...props
}: AnimatedSectionProps) {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: '-100px' });

	const variants = {
		hidden: {
			opacity: 0,
			y: 50,
			scale: 0.9,
			rotate: -5,
		},
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			rotate: 0,
			transition: {
				duration: 0.8,
				delay,
				ease: [0.42, 0, 0.58, 1],
				staggerChildren: 0.15,
			},
		},
		exit: {
			opacity: 0,
			y: -50,
			scale: 0.9,
			rotate: 5,
			transition: {
				duration: 0.5,
				ease: 'easeInOut',
			},
		},
	};

	return (
		<motion.div
			ref={ref}
			initial="hidden"
			animate={isInView ? 'visible' : 'hidden'}
			exit="exit"
			variants={variants}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}

export const AnimatedElement = motion.div;

// Different animation variants for different elements
export const elementVariants: Record<string, Variants> = {
	fadeIn: {
		hidden: {
			opacity: 0,
			y: 20,
			scale: 0.95,
		},
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				duration: 0.6,
				ease: [0.42, 0, 0.58, 1],
			},
		},
	},
	slideIn: {
		hidden: {
			x: -100,
			opacity: 0,
		},
		visible: {
			x: 0,
			opacity: 1,
			transition: {
				duration: 0.7,
				ease: [0.42, 0, 0.58, 1],
			},
		},
	},
	scaleIn: {
		hidden: {
			scale: 0.8,
			opacity: 0,
		},
		visible: {
			scale: 1,
			opacity: 1,
			transition: {
				duration: 0.6,
				ease: [0.42, 0, 0.58, 1],
			},
		},
	},
	rotateIn: {
		hidden: {
			rotate: -10,
			scale: 0.9,
			opacity: 0,
		},
		visible: {
			rotate: 0,
			scale: 1,
			opacity: 1,
			transition: {
				duration: 0.6,
				ease: [0.42, 0, 0.58, 1],
			},
		},
	},
};

// Container variants for staggered animations
export const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.15,
			delayChildren: 0.3,
		},
	},
};
