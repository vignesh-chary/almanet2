import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';

export const useJobRecommendations = () => {
    return useQuery({
        queryKey: ['jobRecommendations'],
        queryFn: async () => {
            console.log('Fetching job recommendations...');
            try {
                const response = await axiosInstance.get('/jobs/recommendations');
                console.log('Recommendations response:', response.data);

                if (!response.data.success) {
                    console.error('Error in recommendations response:', response.data);
                    throw new Error(response.data.message || 'Failed to get recommendations');
                }

                if (!response.data.recommendations) {
                    console.warn('No recommendations in response');
                    return [];
                }

                console.log('Number of recommendations:', response.data.recommendations.length);
                return response.data.recommendations;
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                throw error;
            }
        },
        enabled: true,
    });
}; 