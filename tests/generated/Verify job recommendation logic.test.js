const { JobMatcher } = require('./JobMatcher');
const { FeatureVector } = require('./FeatureVector');

describe('Job Matcher', () => {
  let jobMatcher;
  let featureVector1, featureVector2, featureVector3;

  beforeEach(() => {
    jobMatcher = new JobMatcher();
    featureVector1 = new FeatureVector([0.5, 0.3, 0.8]);
    featureVector2 = new FeatureVector([0.4, 0.2, 0.7]);
    featureVector3 = new FeatureVector([0.6, 0.4, 0.9]);
  });

  it('matches jobs based on similarity of combined features', () => {
    const job1 = { id: 'job1', features: featureVector1 };
    const job2 = { id: 'job2', features: featureVector2 };
    const job3 = { id: 'job3', features: featureVector3 };

    jobMatcher.addJob(job1);
    jobMatcher.addJob(job2);
    jobMatcher.addJob(job3);

    const matchedJobs = jobMatcher.matchJobs(job1, 0.5);

    expect(matchedJobs).toEqual(['job2']);
  });
});