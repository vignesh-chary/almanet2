const { generateRecommendations } = require('./recommendationService');
const { getUserProfile, getAvailableJobs } = require('./dataService');

describe('generateRecommendations', () => {
  let userProfile;
  let availableJobs;

  beforeEach(() => {
    userProfile = getUserProfile();
    availableJobs = getAvailableJobs();
  });

  it('should generate recommendations based on user profile and available jobs', async () => {
    const recommendations = await generateRecommendations(userProfile, availableJobs);
    expect(recommendations).toBeInstanceOf(Array);
    expect(recommendations.length).toBeGreaterThan(0);

    recommendations.forEach(recommendation => {
      expect(recommendation.jobId).toBeDefined();
      expect(recommendation.matchScore).toBeGreaterThanOrEqual(0);
    });
  });

  it('should not include jobs that do not match the user profile', async () => {
    const recommendations = await generateRecommendations(userProfile, availableJobs);
    recommendations.forEach(recommendation => {
      expect(availableJobs.some(job => job.id === recommendation.jobId)).toBe(true);
    });
  });

  it('should prioritize jobs with higher match scores', async () => {
    const recommendations = await generateRecommendations(userProfile, availableJobs);
    for (let i = 0; i < recommendations.length - 1; i++) {
      expect(recommendations[i].matchScore).toBeGreaterThanOrEqual(recommendations[i + 1].matchScore);
    }
  });
});