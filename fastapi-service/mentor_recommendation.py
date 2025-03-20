import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load pre-trained NLP model for embeddings
nlp_model = SentenceTransformer('all-MiniLM-L6-v2')


# Preprocess mentor and student data
def preprocess_data(mentors, student):
    try:
        # Combine skills, experience, education, industry, and expertise for mentors
        mentor_data = []
        for mentor in mentors:
            skills = " ".join(mentor.get("userId", {}).get("skills", [])) if mentor.get("userId", {}).get("skills") else "No skills"
            experience = " ".join([exp.get("title", "") for exp in mentor.get("userId", {}).get("experience", [])]) if mentor.get("userId", {}).get("experience") else "No experience"
            education = " ".join([edu.get("fieldOfStudy", "") for edu in mentor.get("userId", {}).get("education", [])]) if mentor.get("userId", {}).get("education") else "No education"
            industry = mentor.get("industry", "No industry")
            expertise = " ".join(mentor.get("expertise", [])) if mentor.get("expertise") else "No expertise"
            combined_features = f"{skills} {experience} {education} {industry} {expertise}"
            mentor_data.append({
                "_id": mentor["_id"],
                "userId": mentor["userId"]["_id"],
                "combined_features": combined_features,
            })

        # Combine skills, experience, education, and industry for the student
        student_skills = " ".join(student.get("skills", [])) if student.get("skills") else "No skills"
        student_experience = " ".join([exp.get("title", "") for exp in student.get("experience", [])]) if student.get("experience") else "No experience"
        student_education = " ".join([edu.get("fieldOfStudy", "") for edu in student.get("education", [])]) if student.get("education") else "No education"
        student_industry = student.get("industry", "No industry")
        student_features = f"{student_skills} {student_experience} {student_education} {student_industry}"

        return mentor_data, student_features
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

# FAISS-based recommendation system
# def get_mentor_recommendations(mentors, student_features, top_n=5):
#     try:
#         # Preprocess data
#         mentor_data, student_features = preprocess_data(mentors, student_features)

#         # Generate embeddings for mentors and student
#         mentor_texts = [m["combined_features"] for m in mentor_data]
#         mentor_embeddings = generate_embeddings(mentor_texts)
#         student_embedding = generate_embeddings([student_features])[0]

#         # Build FAISS index
#         dimension = mentor_embeddings.shape[1]
#         index = faiss.IndexFlatL2(dimension)
#         index.add(np.array(mentor_embeddings).astype('float32'))

#         # Search for similar mentors
#         distances, indices = index.search(np.array([student_embedding]).astype('float32'), top_n)

#         # Get recommended mentors
#         recommendations = [{
#             "_id": mentor_data[i]["_id"],
#             "userId": mentor_data[i]["userId"],
#             "similarityScore": float(1 - distances[0][i]),  # Convert distance to similarity score
#         } for i in indices[0]]

#         return recommendations
#     except Exception as e:
#         logger.error(f"Error generating mentor recommendations: {e}")
#         raise

def get_mentor_recommendations(mentors, student_features, top_n=5):
    try:
        # Limit top_n to the number of available mentors
        top_n = min(top_n, len(mentors))

        # Preprocess data
        mentor_data, student_features = preprocess_data(mentors, student_features)

        # Generate embeddings for mentors and student
        mentor_texts = [m["combined_features"] for m in mentor_data]
        mentor_embeddings = generate_embeddings(mentor_texts)
        student_embedding = generate_embeddings([student_features])[0]

        # Build FAISS index
        dimension = mentor_embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(np.array(mentor_embeddings).astype('float32'))

        # Search for similar mentors
        distances, indices = index.search(np.array([student_embedding]).astype('float32'), top_n)

        # Get recommended mentors (ensure uniqueness)
        unique_recommendations = []
        seen_mentor_ids = set()
        for i in indices[0]:
            mentor_id = mentor_data[i]["_id"]
            if mentor_id not in seen_mentor_ids:
                unique_recommendations.append({
                    "_id": mentor_id,
                    "userId": mentor_data[i]["userId"],
                    "similarityScore": float(1 - distances[0][i]),  # Convert distance to similarity score
                })
                seen_mentor_ids.add(mentor_id)

        # Log the recommendations for debugging
        logger.info(f"Recommended mentors: {unique_recommendations}")

        return unique_recommendations
    except Exception as e:
        logger.error(f"Error generating mentor recommendations: {e}")
        raise
