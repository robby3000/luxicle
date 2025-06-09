import { QueryClient } from '@tanstack/react-query';

// Create a new instance of QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global default options for all queries
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true, // Refetch on window focus
      retry: 1, // Retry failed requests once
    },
    mutations: {
      // Global default options for all mutations
      retry: 0, // Do not retry mutations by default
    },
  },
});

export default queryClient;

// You will typically wrap your application with QueryClientProvider in your main layout or app file:
// import { QueryClientProvider } from '@tanstack/react-query';
// import queryClient from '@/lib/query-client';
//
// function MyApp({ Component, pageProps }) {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <Component {...pageProps} />
//     </QueryClientProvider>
//   );
// }
// export default MyApp;
