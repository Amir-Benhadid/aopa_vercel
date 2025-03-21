'use client';

import { useEffect, useRef } from 'react';

export function useEqualHeight() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const equalizeHeights = () => {
			const container = containerRef.current;
			if (!container) return;

			const items = container.children;
			const rows: HTMLElement[][] = [];
			let currentRow: HTMLElement[] = [];
			let currentRowTop = 0;

			// Group items into rows based on their position
			Array.from(items).forEach((item) => {
				const element = item as HTMLElement;
				const { top } = element.getBoundingClientRect();

				if (currentRow.length === 0) {
					currentRowTop = top;
					currentRow.push(element);
				} else if (Math.abs(top - currentRowTop) < 2) {
					currentRow.push(element);
				} else {
					rows.push(currentRow);
					currentRow = [element];
					currentRowTop = top;
				}
			});
			if (currentRow.length > 0) {
				rows.push(currentRow);
			}

			// Set equal heights for each row
			rows.forEach((rowItems) => {
				const maxHeight = Math.max(...rowItems.map((el) => el.scrollHeight));
				rowItems.forEach((el) => {
					el.style.height = `${maxHeight}px`;
				});
			});
		};

		equalizeHeights();

		const observer = new ResizeObserver(equalizeHeights);
		const container = containerRef.current;
		if (container) {
			observer.observe(container);
		}

		return () => {
			if (container) {
				observer.unobserve(container);
			}
		};
	}, []);

	return containerRef;
}
