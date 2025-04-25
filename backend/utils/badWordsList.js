export default {
    EXPLICIT_WORDS: [
      // English
      "fuck", "fucking", "fucker", "fucks",
      "shit", "shitty", "shitter", "shits",
      "asshole", "assholes", "ass",
      "cunt", "cunts",
      "bitch", "bitches",
      "cock", "cocks",
      "pussy", "pussies",
      "dick", "dicks",
      "bastard", "bastards",
      "wank", "wanker", "wanking",
      "slut", "sluts",
      "whore", "whores",
      "jerk", "jerking",
      "cum", "cumming",
      "blowjob", "blowjobs",
      "tits",
      "nigger", "niggers", // Be cautious with this and similar racial slurs; consider broader context detection
      "faggot", "faggots", // Same caution as above
      "dyke", "dykes",     // Same caution as above
  
      // Hindi transliterations (more variations)
      "lund", "lundh", "lunda",
      "chutiya", "chutiye", "chutiyon",
      "gandu", "gand", "gandi", "ganduo",
      "bosdi", "bhosdi", "bosdike", "bhosdike",
  
      // Telugu transliterations (more variations)
      "puku", "pukulo", "pukulona",
      "lanja", "lanjalu", "lanjakoduku",
      "nayi", "kutti", // "kutti" can also mean puppy, context is important
  
      // Other potentially offensive terms (add more as needed)
      "motherfucker", "motherfucking",
    ],
  
    REGEX_PATTERNS_ORIGINAL: [
      // Symbol variations (more comprehensive)
      /f[*!@#$%^&()+\-=\[\]\\';,.\/{}|:"<>?]{1,3}u[*!@#$%^&()+\-=\[\]\\';,.\/{}|:"<>?]{1,3}c[*!@#$%^&()+\-=\[\]\\';,.\/{}|:"<>?]{1,3}k/gi,
      /s[*!@#$%^&()+\-=\[\]\\';,.\/{}|:"<>?]{1,3}h[*!@#$%^&()+\-=\[\]\\';,.\/{}|:"<>?]{1,3}i[*!@#$%^&()+\-=\[\]\\';,.\/{}|:"<>?]{1,3}t/gi,
      /a[*!@#$%^&()+\-=\[\]\\';,.\/{}|:"<>?]{1,3}s[*!@#$%^&()+\-=\[\]\\';,.\/{}|:"<>?]{1,3}s/gi,
      /c[*!@#$%^&()+\-=\[\]\\';,.\/{}|:"<>?]{1,3}u[*!@#$%^&()+\-=\[\]\\';,.\/{}|:"<>?]{1,3}n[*!@#$%^&()+\-=\[\]\\';,.\/{}|:"<>?]{1,3}t/gi,
      /b[*!@#$%^&()+\-=\[\]\\';,.\/{}|:"<>?]{1,3}i[*!@#$%^&()+\-=\[\]\\';,.\/{}|:"<>?]{1,3}t[*!@#$%^&()+\-=\[\]\\';,.\/{}|:"<>?]{1,3}c[*!@#$%^&()+\-=\[\]\\';,.\/{}|:"<>?]{1,3}h/gi,
      /l[\W_]*u[\W_]*n[\W_]*d/gi, // Handles _, spaces, etc.
      /m[\W_]*a[\W_]*d[\W_]*a[\W_]*r[\W_]*c[\W_]*h[\W_]*o[\W_]*d/gi,
      /\b(a[\W_]*s[\W_]*s)\b/gi, // Ensures it's a whole word or part of a variation
      /p[\W_]*u[\W_]*k[\W_]*u/gi,
      /l[\W_]*a[\W_]*n[\W_]*j[\W_]*a/gi,
      /n[\W_]*a[\W_]*y[\W_]*i/gi,
  
      // Leet speak (more variations)
      /[4a@]+s+[s\$]+/gi,
      /s+[h5]+[i1]+[t7]+/gi,
      /[fph]+[u]+c+[k]/gi,
      /l[u]+n[d]/gi,
      /p[u]+k[u]/gi,
  
      // Repeated characters (more than 2 repetitions - already in your normalizeText)
      /(.)\1{2,}/gi, // Consider if you want to handle this here as well
  
      // Combinations and close spellings (add more as needed)
      /f\s*k/gi, // f k
      /s\s*t/gi, // s t
    ],
  
    REGEX_PATTERNS_NORMALIZED: [
      // Post-normalization patterns (more comprehensive)
      /fuck/gi,
      /fucking/gi,
      /fucker/gi,
      /shit/gi,
      /shitty/gi,
      /asshole/gi,
      /ass/gi,
      /cunt/gi,
      /bitch/gi,
      /cock/gi,
      /pussy/gi,
      /dick/gi,
      /bastard/gi,
      /wank/gi,
      /slut/gi,
      /whore/gi,
      /jerk/gi,
      /cum/gi,
      /blowjob/gi,
      /tits/gi,
      /nigger/gi, // Still needs careful handling
      /faggot/gi, // Still needs careful handling
      /dyke/gi,   // Still needs careful handling
      /lund/gi,
      /chutiya/gi,
      /gandu/gi,
      /bosdi/gi,
      /puku/gi,
      /lanja/gi,
      /nayi/gi,
      /madarchod/gi,
      /motherfucker/gi,
    ]
  };