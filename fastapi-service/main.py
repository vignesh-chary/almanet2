from fastapi import FastAPI, HTTPException,Request
from fastapi.middleware.cors import CORSMiddleware  # Import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from mentor_recommendation import get_mentor_recommendations
from job_recommendation import get_job_recommendations
import logging
import uvicorn
from rapidfuzz import fuzz
from naughty_words import NAUGHTY_WORDS
# top of main.py


app = FastAPI()
# Add CORS middleware (if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (update this for production)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic model for request body
class UserRequest(BaseModel):
    user_id: str
    users: List[dict]

class MentorRecommendationRequest(BaseModel):
    student: dict
    mentors: List[dict]

class JobRecommendationRequest(BaseModel):
    user: dict
    jobs: List[dict]

class Content(BaseModel):
    content: str



FUZZY_BLOCK_LIST = [
    "fuck", "shit", "bitch", "kutte", "bhosdi", "madarchod", "scheisse"
]

ALL_BAD_WORDS = FUZZY_BLOCK_LIST + NAUGHTY_WORDS

def is_fuzzy_match(word, bad_word):
    length = len(word)
    score = fuzz.partial_ratio(word, bad_word)

    if length <= 3:
        return False  # too short to match safely
    elif length <= 5:
        return score > 90
    else:
        return score > 85
    

# Preprocess user data
def preprocess_user(user):
    try:
        # Handle empty or missing fields
        skills = " ".join(user.get("skills", [])) if user.get("skills") else "No skills"
        industry = user.get("industry", "No industry")
        education = " ".join([edu.get("fieldOfStudy", "") for edu in user.get("education", [])]) if user.get("education") else "No education"

        # Combine features
        combined_features = f"{skills} {industry} {education}"

        # Log the combined features
        # logger.info(f"Combined features for user {user['_id']}: {combined_features}")

        return combined_features
    except Exception as e:
        logger.error(f"Error preprocessing user: {e}")
        raise

# Generate recommendations
def get_recommendations(user_id, users, top_n=5):
    try:
        # Create a DataFrame for users
        user_data = []
        for user in users:
            combined_features = preprocess_user(user)

            # Skip users with empty combined_features (if needed)
            if not combined_features.strip():
                logger.warning(f"Skipping user {user['_id']} due to empty combined_features")
                continue

            user_data.append({
                "_id": user["_id"],
                "name": user.get("name", ""),
                "combined_features": combined_features,
                "username": user.get("username", "") # add username
            })

        # Check if user_data is empty
        if not user_data:
            logger.error("No valid users found for recommendations")
            return []

        df = pd.DataFrame(user_data)

        # Log the DataFrame
        logger.info(f"DataFrame created: {df}")

        # Vectorize combined features using TF-IDF
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(df["combined_features"])

        # Compute cosine similarity
        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

        # Find recommendations
        user_index = df[df["_id"] == user_id].index[0]
        sim_scores = list(enumerate(cosine_sim[user_index]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:top_n + 1]  # Exclude the user themselves
        recommended_user_indices = [i[0] for i in sim_scores]
        return df.iloc[recommended_user_indices].to_dict("records")
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        raise

# FastAPI endpoint
@app.post("/recommend")
async def recommend(user_request: UserRequest):
    try:
        logger.info(f"Received request for user_id: {user_request.user_id}")
        logger.info(f"Users data received: {user_request.users}")

        # Validate users list
        if not user_request.users:
            raise HTTPException(status_code=400, detail="Users list is empty")

        # Validate user_id exists in users list
        user_ids = [user.get("_id") for user in user_request.users]
        if user_request.user_id not in user_ids:
            raise HTTPException(status_code=404, detail="User ID not found in users list")

        # Generate recommendations
        recommendations = get_recommendations(user_request.user_id, user_request.users)
        return {"recommendations": recommendations}
    except HTTPException as e:
        raise
    except Exception as e:
        logger.error(f"Error in /recommend endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# New endpoint for mentor recommendations
@app.post("/recommend-mentors")
async def recommend_mentors(request: MentorRecommendationRequest):
    try:
        logger.info("Received request for mentor recommendations")
        recommendations = get_mentor_recommendations(request.mentors, request.student)
        return {"recommendations": recommendations}
    except Exception as e:
        logger.error(f"Error in /recommend-mentors endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    


@app.post("/moderate")

async def moderate(content: Content):
    text = content.content.lower()
    
    # Check for best fuzzy match
    result = process.extractOne(
        text, 
        ALL_BAD_WORDS, 
        scorer=fuzz.partial_ratio,
        score_cutoff=85
    )
    
    return {"flagged": bool(result)}

async def moderate(content: Content):
    text = content.content.lower()
    tokens = text.split()

    for token in tokens:
        for bad in ALL_BAD_WORDS:
            if is_fuzzy_match(token, bad):
                return {"flagged": True}
    
    return {"flagged": False}

@app.post("/recommend-jobs")
async def recommend_jobs(request: JobRecommendationRequest):
    try:
        recommendations = get_job_recommendations(request.jobs, request.user)
        return {"success": True, "recommendations": recommendations}
    except Exception as e:
        logger.error(f"Error in job recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)