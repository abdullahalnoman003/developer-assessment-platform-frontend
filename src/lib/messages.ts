/**
 * Every user-facing string for server actions lives here so feedback stays
 * consistent and can be reviewed in one place.
 */
export const ACTION_MESSAGES = {
  login: {
    success: "Welcome back. Taking you to your dashboard…",
    failure: "Sign in failed. Check your email and password.",
  },
  register: {
    success: "Account created. Welcome to CodeArena.",
    failure: "Could not create your account.",
  },
  google: {
    success: "Signed in with Google.",
    failure: "Google sign-in was not completed.",
  },
  logout: {
    success: "You are signed out.",
    failure: "Sign out failed. Please try again.",
  },
  updateProfile: {
    success: "Profile updated.",
    failure: "Could not update your profile.",
  },
  upsertCompany: {
    success: "Company details saved.",
    failure: "Could not save your company.",
  },
  createQuestion: {
    success: "Question added to your library.",
    failure: "Could not create the question.",
  },
  updateQuestion: {
    success: "Question updated.",
    failure: "Could not update the question.",
  },
  deleteQuestion: {
    success: "Question removed.",
    failure: "Could not remove the question.",
  },
  createAssessment: {
    success: "Assessment created as a draft.",
    failure: "Could not create the assessment.",
  },
  updateAssessment: {
    success: "Assessment updated.",
    failure: "Could not update the assessment.",
  },
  deleteAssessment: {
    success: "Assessment deleted.",
    failure: "Could not delete the assessment.",
  },
  inviteCandidates: {
    success: "Invitations sent.",
    failure: "Could not send the invitations.",
  },
  revokeInvitation: {
    success: "Invitation revoked.",
    failure: "Could not revoke the invitation.",
  },
  startAttempt: {
    success: "Attempt started.",
    failure: "Could not start the attempt.",
  },
  saveAnswers: {
    success: "Progress saved.",
    failure: "Could not save your progress.",
  },
  submitAttempt: {
    success: "Attempt submitted for evaluation.",
    failure: "Could not submit the attempt.",
  },
  evaluateAttempt: {
    success: "Scores saved and results released.",
    failure: "Could not save the evaluation.",
  },
  initiatePayment: {
    success: "Redirecting you to checkout…",
    failure: "Could not start checkout.",
  },
  updateUserStatus: {
    success: "User updated.",
    failure: "Could not update the user.",
  },
} as const;

export const VALIDATION_MESSAGES = {
  generic: "Please fix the highlighted fields.",
  network:
    "Could not reach the CodeArena API. Check that the backend is running.",
  unauthorized: "Your session has expired. Please sign in again.",
  forbidden: "You do not have permission to do that.",
  rateLimited: "Too many requests. Please slow down and try again shortly.",
  unknown: "Something went wrong. Please try again.",
} as const;

export const EMPTY_STATES = {
  questions: {
    title: "No questions yet",
    body: "Add your first question to start building a question library you can reuse across assessments.",
  },
  assessments: {
    title: "No assessments yet",
    body: "Create an assessment, attach questions, then publish it to invite candidates.",
  },
  invitations: {
    title: "No candidates invited yet",
    body: "Publish the assessment and invite candidates by email to see them here.",
  },
  attempts: {
    title: "No attempts to evaluate",
    body: "Submitted attempts land here so you can score written and coding answers.",
  },
  creditHistory: {
    title: "No payments yet",
    body: "Buy a credit pack to start sending invitations.",
  },
  dashboard: {
    title: "Nothing to show yet",
    body: "Your activity will appear here as soon as you take the first step.",
  },
  results: {
    title: "No results yet",
    body: "Once an evaluator releases your result you will see the score here.",
  },
  company: {
    title: "No company yet",
    body: "Recruiters need a company before they can create questions or assessments.",
  },
} as const;

/** Validation payloads the backend returns, mapped to calm, readable copy. */
export const FIELD_ERROR_COPY: Record<string, string> = {
  "body.difficulty": "Choose a difficulty",
  "body.durationMins": "Enter the time limit in minutes",
  "body.passScore": "Pass score must be a number",
  "body.correctAnswer": "Mark the correct answer",
  "body.website": "Enter a valid website URL",
  "body.logoUrl": "Enter a valid logo URL",
  "body.candidateEmails[0]": "That email address is not valid",
  "body.resumeUrl": "Enter a valid resume URL",
  "body.githubUrl": "Enter a valid GitHub URL",
};
