'use client';

import { HTMLMotionProps, motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollAnimationProps extends HTMLMotionProps<'div'> {
	children: ReactNode;
	direction?: 'up' | 'down' | 'left' | 'right';
	distance?: number;
	delay?: number;
	className?: string;
}

export function ScrollAnimation({
	children,
	direction = 'up',
	distance = 50,
	delay = 0,
	className = '',
	...props
}: ScrollAnimationProps) {
	const getDirection = () => {
		switch (direction) {
			case 'up':
				return { y: distance };
			case 'down':
				return { y: -distance };
			case 'left':
				return { x: distance };
			case 'right':
				return { x: -distance };
			default:
				return { y: distance };
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, ...getDirection() }}
			whileInView={{
				opacity: 1,
				x: 0,
				y: 0,
				transition: {
					duration: 0.5,
					delay,
					ease: 'easeOut',
				},
			}}
			viewport={{ once: true, margin: '-100px' }}
			className={className}
			{...props}
		>
			{children}
		</motion.div>
	);
}
