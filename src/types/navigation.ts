export interface NavigationItem {
	href: string;
	label: string;
	icon?: React.ReactNode;
}

export interface QuickAction {
	id: string;
	title: string;
	description: string;
	href: string;
	icon: React.ReactNode;
}
