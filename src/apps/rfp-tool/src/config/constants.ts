/**
 * RFP Tool Constants
 */

// File upload limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
export const MAX_FILES_PER_PROPOSAL = 10
export const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx', '.txt']

// Text limits
export const MAX_SUMMARY_WORDS = 1000

// Timer
export const TIMER_DURATION_MS = 15 * 60 * 1000 // 15 minutes

// Hardcoded assessment questions
export const ASSESSMENT_QUESTIONS = [
    'What is the project budget?',
    'What is the timeline?',
    'What are the key deliverables?',
    'What is the target audience?',
    'Are there compliance requirements?',
] as const

// Tab IDs
export const TOP_LEVEL_TABS = {
    ADMIN: 'admin',
    PROPOSAL_MANAGEMENT: 'proposal-management',
} as const

export const CONTENT_TABS = {
    BUILD: 'build',
    REVIEW: 'review',
} as const

// API delays (ms) for mock simulation
export const MOCK_DELAYS = {
    ANSWER_QUESTIONS: 2000,
    ASSESS_PROPOSAL: 1500,
    CREATE_PROPOSAL: 500,
    GET_PROPOSALS: 500,
    REQUEST_QUOTE: 500,
    UPLOAD_DOCUMENTS: 500,
} as const
