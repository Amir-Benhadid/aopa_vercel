import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Evento Anterior | Asociación de Oftalmología',
	description:
		'Ver detalles, fotos, videos y e-posters de nuestro congreso de oftalmología anterior.',
};

export default function PreviousEventLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
