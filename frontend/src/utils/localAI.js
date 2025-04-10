
// Knowledge base for common questions about SkillXchange
const knowledgeBase = [
  // Greetings
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    response: "Hello! I'm your SkillXchange assistant. How can I help you today?"
  },
  // Teacher Verification
  {
    keywords: ['verification', 'verified', 'teacher', 'certificate'],
    response: "To become a verified teacher on SkillXchange, upload your certificates and portfolio links during profile setup. Our admin team will review and approve your request if everything meets the requirements."
  },
  // Reward System
  {
    keywords: ['reward', 'points', 'earn', 'system'],
    response: "SkillXchange has a reward system where teachers earn points for each session taught. Points can be redeemed for gift cards, premium features, and exclusive rewards. Top mentors also get leaderboard badges."
  },
  // Teaching vs Learning Roles
  {
    keywords: ['teaching', 'learning', 'roles', 'difference', 'switch', 'role'],
    response: "On SkillXchange, teaching allows you to host sessions and earn rewards, while learning lets you attend sessions to acquire new skills. You can select both roles for a complete experience and switch between them anytime from your profile settings."
  },
  // Support and Contact
  {
    keywords: ['contact', 'support', 'help', 'team'],
    response: "If you need help, reach out to our support team via the Contact Support tab in the Help Center or send an email to support@skillxchange.com."
  },
  // Virtual Classroom
  {
    keywords: ['classroom', 'virtual', 'session', 'features', 'video'],
    response: "SkillXchange offers interactive virtual classrooms with HD video calls, screen sharing, and collaborative whiteboards for an immersive learning experience."
  },
  // Payments and Pricing
  {
    keywords: ['payment', 'fee', 'cost', 'price', 'pricing'],
    response: "SkillXchange uses a flexible pricing system where teachers can set their own rates. Payments are securely processed through our integrated system."
  },
  // Matching Algorithm
  {
    keywords: ['match', 'algorithm', 'recommendation', 'connect', 'find'],
    response: "Our AI-powered matching algorithm connects you with the perfect learning partners based on skill compatibility and learning goals."
  },
  // Community & Forums
  {
    keywords: ['community', 'group', 'discussion', 'forum'],
    response: "Join topic-specific groups, participate in discussions, and connect with fellow learners in the SkillXchange Community Hub."
  },
  // Analytics & Progress
  {
    keywords: ['analytics', 'progress', 'tracking', 'metrics', 'growth'],
    response: "Track your skill development with personalized analytics and progress dashboards that help you stay on top of your learning goals."
  },
  // Profile Customization
  {
    keywords: ['profile', 'bio', 'update', 'edit', 'avatar'],
    response: "You can customize your SkillXchange profile with a bio, profile photo, and preferences in the Profile Settings section."
  },
  // Skill Tags / Interests
  {
    keywords: ['skills', 'interests', 'tags', 'categories'],
    response: "Add relevant skills and interest tags to your profile to get better matches and personalized session recommendations."
  },
  // Booking & Scheduling
  {
    keywords: ['book', 'schedule', 'calendar', 'availability'],
    response: "Use the built-in scheduling tool to book or propose sessions. Teachers can set their available times, and learners can choose suitable slots."
  },
  // Notifications & Alerts
  {
    keywords: ['notification', 'alert', 'reminder', 'email', 'updates'],
    response: "Stay updated with session reminders, messages, and important platform news through notifications. You can manage these in your settings."
  },
  // Privacy & Security
  {
    keywords: ['privacy', 'data', 'security', 'safe'],
    response: "We take your privacy seriously. All data is encrypted and stored securely. You have control over what information is public."
  },
  // Reporting & Feedback
  {
    keywords: ['report', 'feedback', 'complaint', 'issue', 'problem'],
    response: "You can report any issues via the session page or user profile. Your feedback helps us maintain a high-quality learning environment."
  },
  {
    keywords: ['badges', 'rank', 'leaderboard'],
    response: "Climb that leaderboard like a pro! 🧗‍♂️💫 The more you teach, the more badges you earn. Bragging rights included! 🏅"
  },
  {
    keywords: ['cancel', 'reschedule', 'missed', 'no show'],
    response: "Plans change, we get it! 😅 You can cancel or reschedule from your sessions tab. Just give your buddy a heads-up, alright? 📅🤝"
  },
  {
    keywords: ['language', 'multilingual', 'translate'],
    response: "We speak your language! 🌍 Well, kind of... While we’re working on full multilingual support, English is our current jam. 🎤🎶"
  },
  {
    keywords: ['mobile', 'app', 'android', 'ios'],
    response: "An app? 👀 Coming soon to a pocket near you! 📱🔥 For now, use SkillXchange on your browser—it’s pretty slick too!"
  },
  {
    keywords: ['dark mode', 'theme', 'light mode'],
    response: "Yes, dark mode exists. 🌚 Because bright screens at 2 AM? No thanks. Toggle it in your settings and protect those eyeballs! 😎🌓"
  },
  {
    keywords: ['notification settings', 'mute', 'emails'],
    response: "Tired of spammy vibes? 📬 No worries! You can fine-tune what you want to hear from us in your Notification Settings. 🔕💌"
  },
  {
    keywords: ['fun', 'cool', 'vibe', 'awesome'],
    response: "We're not just a platform, we’re a *vibe*. 💃✨ Learning here is cooler than ice cream in a snowstorm. 🍦❄️"
  },
  {
    keywords: ['birthday', 'anniversary', 'special day'],
    response: "Is it your special day? 🎉🎂 We might just have a surprise for you if you’ve filled your birthday info. (Hint: 🎁)"
  },
  {
    keywords: ['suggestion', 'idea', 'feature request'],
    response: "Got an idea that’ll blow minds? 🧠💥 We’d love to hear it! Use the feedback tab and drop those genius thoughts. 📝💡"
  },
  {
    keywords: ['trust', 'safety', 'moderation'],
    response: "Safety first, always! 🚨 Our moderation team is on it 24/7, and you can always report anything fishy. No shady stuff allowed. 👮‍♀️🛡️"
  },
 
  
    {
      keywords: ['signup', 'register', 'create account'],
      response: "Joining SkillXchange? Heck yeah! 🙌 Just hit that Sign Up button, fill in the magic details ✨, and boom—you’re in the club 🎉"
    },
    {
      keywords: ['login', 'signin', 'sign in'],
      response: "Welcome back, legend! 🔐 Just enter your email & password like a boss. Lost it? There’s a 'Forgot Password' spell for that 🔮"
    },
    {
      keywords: ['profile', 'setup', 'edit info', 'update profile'],
      response: "Time to show the world who you are 🌍💁‍♀️ — add your skills, bio, profile pic, and portfolio. You can always edit it later. Make it ✨pop✨"
    },
    {
      keywords: ['match', 'matching', 'algorithm', 'connect me', 'find partner'],
      response: "Our AI isn’t just smart—it’s like Cupid with code 🏹💻. It finds your perfect skill match based on your goals, skills, and vibe 💫"
    },
    {
      keywords: ['chat', 'message', 'talk', 'dm', 'conversation'],
      response: "Slide into those DMs, professionally of course 💬😉 Our secure chat lets you connect, plan sessions, and drop those 'hi's!"
    },
    {
      keywords: ['connect', 'connections', 'network', 'friend'],
      response: "Make new connections and grow your learning fam 👥✨ Hit 'Connect' on profiles you vibe with and stay in touch!"
    },
    {
      keywords: ['certificate', 'reward', 'achievement', 'recognition'],
      response: "Teach, earn, and unlock certificates of awesomeness 📜💎. They’re proof you’re not just learning — you’re leveling up!"
    },
    {
      keywords: ['feedback', 'review', 'comments', 'opinions'],
      response: "After a session, drop your feedback 🗣️📋 — constructive, kind, and helpful. Help others grow & shine 🌟"
    },
    {
      keywords: ['rating', 'stars', 'rate', 'mentor rating'],
      response: "Leave a ⭐⭐⭐⭐⭐ (or less if they were meh 😬) for your mentor/learner. Honest ratings = better vibes for all!"
    },
    {
      keywords: ['scheduling', 'calendar', 'session time', 'availability'],
      response: "Pick a time, any time ⏰! Use the built-in calendar to schedule or join sessions based on availability. Easy peasy!"
    },
    {
      keywords: ['security', 'privacy', 'safe', 'data'],
      response: "We take your data as seriously as your chai ☕🔒. Everything’s encrypted, private, and protected like a dragon guards treasure 🐉💼"
    },
    {
      keywords: ['level up', 'upgrade', 'premium'],
      response: "Want extra perks? 🎁 Upgrade to SkillXchange Premium for faster matches, priority support, exclusive badges, and more!"
    }
 
  
];

// Fallback responses when no match is found
const fallbackResponses = [
  "Uhh... I didn’t catch that 🧐. Try asking about sessions, rewards, or how to get verified!",
  "Hmm, I'm still training my brain for that one 🧠💭. Wanna ask about something cool on SkillXchange?",
  "That’s above my pay grade 😅 Ask me anything about teaching, learning, or making friends here!",
  "Interesting... but I need more context 🤔. Try a keyword like 'points' or 'profile' maybe?",
  "Oops! I’m feeling a bit clueless 🤖💔. Wanna try rephrasing that one?"
];

/**
 * Generate a response based on user input
 * @param {string} userInput - The user's message
 * @returns {string} AI response
 */
export const generateLocalResponse = (userInput) => {
  // Convert input to lowercase for easier matching
  const input = userInput.toLowerCase();
  
  // Check for matches in knowledge base
  const matches = knowledgeBase.filter(item => 
    item.keywords.some(keyword => input.includes(keyword))
  );
  
  // Sort matches by number of matching keywords
  matches.sort((a, b) => {
    const aMatches = a.keywords.filter(keyword => input.includes(keyword)).length;
    const bMatches = b.keywords.filter(keyword => input.includes(keyword)).length;
    return bMatches - aMatches; // Higher number of matches first
  });
  
  // Return the best match or a random fallback
  if (matches.length > 0) {
    return matches[0].response;
  } else {
    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
    return fallbackResponses[randomIndex];
  }
};

/**
 * Simulate a thinking delay to make the AI feel more realistic
 * @returns {Promise} Promise that resolves after a delay
 */
export const simulateThinking = () => {
  // Random delay between 500ms and 1500ms
  const delay = Math.floor(Math.random() * 1000) + 500;
  return new Promise(resolve => setTimeout(resolve, delay));
}; 