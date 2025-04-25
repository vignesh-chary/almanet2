import Filter from "bad-words";
import customList from "../utils/badWordsList.js";
import axios from "axios";

const baseFilter = new Filter();
baseFilter.addWords(...customList.EXPLICIT_WORDS);

function normalizeText(text) {
  if (!text) return ""; // Return empty string if text is undefined or null
  return text
  .toLowerCase()
  .replace(/\s+/g, "")    // Remove all whitespace first
  .replace(/[^a-z0-9]/g, "") // Then remove remaining non-alphanumerics
  .replace(/(.)\1{2,}/g, "$1$1"); // Limit repeats
    // .toLowerCase()
    // .replace(/[^a-zA-Z0-9\s]/g, "") // remove symbols
    // .replace(/(.)\1{2,}/g, "$1");  // replace repeated letters
}

async function contentModeration(req, res, next) {
    console.log("contentModeration middleware");
    console.log("req.body:", req.body);
    
  try {
    // Get content from req.body, defaulting to empty string if undefined
    const content = req.body && req.body.content ? req.body.content : "";
    console.log("content:", content);
    
    // Skip moderation if content is empty
    if (!content || !content.trim()) {
      console.log("Skipping moderation for empty content");
      return next();
    }

    console.log("Proceeding with content moderation");
    
    // Step 1: Check against original-content regex patterns
    if (customList.REGEX_PATTERNS_ORIGINAL.some(regex => regex.test(content))) {
      console.log("Content failed original regex check");
      return res.status(400).json({ message: "Content violates community standards." });
    }
    
    // Step 2: Local base filter
    const cleanedText = normalizeText(content);
    console.log("Cleaned text:", cleanedText);

    if (
      baseFilter.isProfane(cleanedText) ||
      customList.REGEX_PATTERNS_NORMALIZED.some(regex => regex.test(cleanedText))
    ) {
      console.log("Content failed normalized regex check");
      return res.status(400).json({ message: "Content violates community standards." });
    }

    console.log("Content passed local filter check");
    
    // Skip AI moderation for simple content (less than 10 characters)
    if (cleanedText.length < 10) {
      console.log("Skipping AI moderation for simple content");
      return next();
    }
    
    // Step 3: Ask Python for fuzzy/multilingual check
    try {
      const response = await axios.post("http://localhost:8000/moderate", {
        content: cleanedText,
      });
      
      console.log("AI moderation response:", response.data);

      if (response.data.flagged) {
        console.log("Content failed AI moderation check");
        return res.status(400).json({ message: "Content violates community standards (AI)." });
      }
      
      console.log("Content passed AI moderation check");
    } catch (aiError) {
      console.error("Error in AI moderation:", aiError.message);
      // Continue without AI moderation if it fails
    }

    next();
  } catch (error) {
    console.error("Moderation error:", error.message);
    return res.status(500).json({ message: "Moderation service error." });
  }
}

export default contentModeration;