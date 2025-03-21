'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface CongressContextType {
	currentCongressId: string | null;
	setCurrentCongressId: (id: string | null) => void;
}

const CongressContext = createContext<CongressContextType | undefined>(
	undefined
);

export function CongressProvider({ children }: { children: ReactNode }) {
	const [currentCongressId, setCurrentCongressId] = useState<string | null>(
		null
	);

	return (
		<CongressContext.Provider
			value={{ currentCongressId, setCurrentCongressId }}
		>
			{children}
		</CongressContext.Provider>
	);
}

export function useCongress() {
	const context = useContext(CongressContext);
	if (!context) {
		throw new Error('useCongress must be used within a CongressProvider');
	}
	return context;
}
