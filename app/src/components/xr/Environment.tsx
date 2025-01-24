import { Floors } from './room/Floors';
import { Walls } from './room/Walls';

export const Environment = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<Walls />
			<Floors />
			{children}
		</>
	);
};
