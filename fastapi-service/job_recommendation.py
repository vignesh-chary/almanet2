import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load pre-trained NLP model for embeddings
nlp_model = SentenceTransformer('all-MiniLM-L6-v2')

def preprocess_education(education):
    if not education:
        return ""
    education_text = []
    for edu in education:
        degree = edu.get("degree", "")
        field = edu.get("fieldOfStudy", "")
        school = edu.get("school", "")
        education_text.append(f"{degree} in {field} from {school}")
    return " ".join(education_text)

def preprocess_experience(experience):
    if not experience:
        return ""
    experience_text = []
    for exp in experience:
        title = exp.get("title", "")
        company = exp.get("company", "")
        description = exp.get("description", "")
        experience_text.append(f"{title} at {company}: {description}")
    return " ".join(experience_text)

# Preprocess job and user data
def preprocess_data(jobs, user):
    try:
        # Combine job features
        job_data = []
        for job in jobs:
            title = job.get("title", "")
            description = job.get("description", "")
            requirements = " ".join(job.get("requirements", []))
            location = job.get("location", "")
            job_type = job.get("jobType", "")
            experience_level = job.get("experienceLevel", "")
            position = job.get("position", "")
            
            combined_features = f"{title} {description} {requirements} {location} {job_type} {experience_level} {position}"
            job_data.append({
                "_id": job["_id"],
                "combined_features": combined_features,
            })

        # Combine user features with more emphasis on education
        user_skills = " ".join(user.get("skills", [])) if user.get("skills") else ""
        user_experience = preprocess_experience(user.get("experience", []))
        user_education = preprocess_education(user.get("education", []))
        user_industry = user.get("industry", "")
        user_interests = " ".join(user.get("interests", [])) if user.get("interests") else ""
        
        # Weight education more heavily in the user features
        user_features = f"{user_education} {user_skills} {user_experience} {user_industry} {user_interests}"

        return job_data, user_features
    except Exception as e:
        logger.error(f"Error preprocessing data: {e}")
        raise

# Generate embeddings using NLP model
def generate_embeddings(texts):
    try:
        return nlp_model.encode(texts)
    except Exception as e:
        logger.error(f"Error generating embeddings: {e}")
        raise

# Get job recommendations using FAISS for efficient similarity search
def get_job_recommendations(jobs, user_features, top_n=3):
    try:
        logger.info(f"Starting job recommendations for user: {user_features.get('_id', 'unknown')}")
        logger.info(f"Number of jobs to process: {len(jobs)}")
        
        # Preprocess data
        job_data, user_features = preprocess_data(jobs, user_features)
        logger.info(f"Preprocessed user features: {user_features[:200]}...")  # Log first 200 chars
        
        # Generate embeddings
        job_texts = [job["combined_features"] for job in job_data]
        logger.info(f"Generated job texts, first job: {job_texts[0][:200]}...")
        
        job_embeddings = generate_embeddings(job_texts)
        user_embedding = generate_embeddings([user_features])[0]
        logger.info("Generated embeddings successfully")
        
        # Create FAISS index
        dimension = job_embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(job_embeddings.astype('float32'))
        
        # Search for similar jobs - increase top_n to get more candidates for deduplication
        search_n = min(top_n * 3, len(jobs))  # Get more candidates than needed
        distances, indices = index.search(user_embedding.reshape(1, -1).astype('float32'), search_n)
        logger.info(f"Search results - indices: {indices}, distances: {distances}")
        
        # Format recommendations and ensure uniqueness
        seen_job_ids = set()
        recommendations = []
        
        for i, idx in enumerate(indices[0]):
            if len(recommendations) >= top_n:
                break
                
            job = jobs[idx]
            job_id = str(job.get('_id'))  # Convert to string to ensure consistent comparison
            
            # Skip if we've already seen this job
            if job_id in seen_job_ids:
                logger.info(f"Skipping duplicate job: {job.get('title', 'No title')} (ID: {job_id})")
                continue
                
            similarity_score = 1 / (1 + distances[0][i])  # Convert distance to similarity score
            logger.info(f"Job {idx}: {job.get('title', 'No title')} (ID: {job_id}) - Score: {similarity_score}")
            
            recommendations.append({
                "job": job,
                "score": float(similarity_score)
            })
            seen_job_ids.add(job_id)
        
        logger.info(f"Returning {len(recommendations)} unique recommendations")
        for rec in recommendations:
            logger.info(f"Recommended job: {rec['job'].get('title', 'No title')} (ID: {rec['job'].get('_id')}) - Score: {rec['score']}")
        
        return recommendations
    except Exception as e:
        logger.error(f"Error getting job recommendations: {e}")
        raise 