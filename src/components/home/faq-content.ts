export interface FaqEntry {
  question: string;
  answer: string;
  group: "Assessment" | "Invitations & credits" | "Attempts" | "Account";
}

export const FAQ_GROUPS = [
  "Assessment",
  "Invitations & credits",
  "Attempts",
  "Account",
] as const;

export const FAQ: readonly FaqEntry[] = [
  {
    group: "Assessment",
    question: "What question types can an assessment contain?",
    answer:
      "Three: multiple choice, written and coding. Each question carries its own type and one of three difficulty levels, and multiple choice questions are graded by the backend as soon as an attempt is submitted.",
  },
  {
    group: "Assessment",
    question: "How long does an assessment stay editable?",
    answer:
      "For as long as it is a draft. Publishing moves it to published, and an assessment is not silently rewritten while candidates are working on it. Close or archive it when the round is over.",
  },
  {
    group: "Invitations & credits",
    question: "What happens when I invite a candidate?",
    answer:
      "The invitation starts as pending. The candidate can accept or decline it, and you can revoke it while it is still pending. Accepting is what makes the assessment startable by that candidate.",
  },
  {
    group: "Invitations & credits",
    question: "What exactly do credits do?",
    answer:
      "Credits are granted to your company when a payment completes, and the remaining balance is shown on the company dashboard. The balance is stored server-side and displayed exactly as the backend reports it.",
  },
  {
    group: "Invitations & credits",
    question: "How do I pay for more credits?",
    answer:
      "Recruiters with a company profile can start a Stripe checkout for the Starter, Pro or Enterprise pack from the billing page. The app runs against Stripe test mode, so no real money moves.",
  },
  {
    group: "Attempts",
    question: "Is a timer enforced on an attempt?",
    answer:
      "Yes. An attempt inherits the assessment duration and carries a deadline. The backend also refuses to start a second attempt for the same invitation.",
  },
  {
    group: "Attempts",
    question: "Does a candidate see their score immediately?",
    answer:
      "No. A score is not visible to the candidate until you release the result. Before that, the attempt simply appears as in progress on their side.",
  },
  {
    group: "Attempts",
    question: "What does the evaluator see?",
    answer:
      "Every answer on the attempt, including the multiple choice ones the backend already scored. You add scores and a note for the written and coding questions, then release the result.",
  },
  {
    group: "Account",
    question: "Can I try CodeArena before creating a company?",
    answer:
      "Yes. The sign-in page offers one-click demo accounts for the candidate, recruiter and admin roles, so you can walk every screen with real seeded data before creating anything.",
  },
  {
    group: "Account",
    question: "Do I need a company to start?",
    answer:
      "Recruiters create their company profile first, because questions, assessments, invitations and billing all hang off that company record. Candidates never need one.",
  },
  {
    group: "Account",
    question: "What happens if an account is suspended?",
    answer:
      "Signing in is refused with a clear explanation and no session is created. Contact support if you believe this is a mistake.",
  },
];
