'use client';

import { ChevronDown } from 'lucide-react';
import * as React from 'react';

interface SelectOption {
	value: string;
	label: string;
}

interface SelectProps {
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	options?: SelectOption[];
	children?: React.ReactNode;
}

export function Select({
	value,
	onValueChange,
	placeholder = 'Select...',
	options = [],
	children,
}: SelectProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const selectedOption = options.find((option) => option.value === value);

	return (
		<div className="relative">
			{children || (
				<button
					type="button"
					className="flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
					onClick={() => setIsOpen(!isOpen)}
				>
					<span className="truncate">
						{selectedOption?.label || placeholder}
					</span>
					<ChevronDown className="w-4 h-4 ml-2" />
				</button>
			)}

			{isOpen && (
				<div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg dark:bg-gray-800">
					{options.map((option) => (
						<div
							key={option.value}
							className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
							onClick={() => {
								onValueChange(option.value);
								setIsOpen(false);
							}}
						>
							{option.label}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export const SelectTrigger = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
	<button
		ref={ref}
		className="flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
		{...props}
	>
		{children}
	</button>
));

export const SelectContent = ({
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg dark:bg-gray-800"
		{...props}
	>
		{children}
	</div>
);

export const SelectItem = ({
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
		{...props}
	>
		{children}
	</div>
);

export const SelectValue = ({
	children,
	...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
	<span className="truncate" {...props}>
		{children}
	</span>
);
