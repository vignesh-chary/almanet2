const { recommendJobs } = require('./jobRecommendationService');
const { User } = require('./models/User');

describe('Job Recommendation System', () => {
  let user;

  beforeEach(() => {
    user = new User({
      skills: ['JavaScript', 'React'],
      industry: 'Technology',
      education: 'Bachelor'
    });
  });

  it('should recommend jobs based on user skills, industry, and education', async () => {
    const recommendedJobs = await recommendJobs(user);
    expect(recommendedJobs).toEqual([
      { title: 'Frontend Developer', company: 'Tech Innovations' },
      { title: 'React Engineer', company: 'Innovate Solutions' }
    ]);
  });

  it('should handle no matching jobs gracefully', async () => {
    user.skills = ['Python', 'Django'];
    const recommendedJobs = await recommendJobs(user);
    expect(recommendedJobs).toEqual([]);
  });
});