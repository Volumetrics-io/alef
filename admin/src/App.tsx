import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Pages } from './pages/Pages.js';
import { queryClient } from './services/queryClient.js';

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Pages />
			<Toaster />
		</QueryClientProvider>
	);
}

export default App;
