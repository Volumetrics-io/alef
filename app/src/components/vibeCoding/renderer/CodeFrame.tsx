import { SceneWrapper } from '@/components/xr/SceneWrapper';

// Basic idea
// We generate the component and inject it into here some how
// We also need to pass in the state of the component
// We also need to pass in the actions that can be taken on the component
// ignore the use of `children` here, i'm just using it to pass linters
// feel free to explore here

export function CodeFrame({ children }: { children: React.ReactNode }) {
	return <SceneWrapper>{children}</SceneWrapper>;
}
