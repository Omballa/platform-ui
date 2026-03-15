/**
 * Mock data and API handlers for the RFP Tool
 * Provides sample proposals and documents for development/testing
 */

import { v4 as uuidv4 } from 'uuid'

import {
    ALLOWED_FILE_TYPES,
    ASSESSMENT_QUESTIONS,
    MAX_FILES_PER_PROPOSAL,
    MAX_FILE_SIZE,
    MAX_SUMMARY_WORDS,
    MOCK_DELAYS,
    TIMER_DURATION_MS,
} from '../../config'
import type {
    AnswerQuestionsRequest,
    AnswerQuestionsResponse,
    AssessProposalRequest,
    AssessProposalResponse,
    CreateProposalRequest,
    Proposal,
    ProposalDocument,
    ProposalsListResponse,
    RequestQuoteResponse,
} from '../models'
import { getFileExtension, getWordCount } from '../utils/validation'

const now = Date.now()

const createProposal = ({
    answers = null,
    createdOffsetMs,
    name,
    pdfUrl = null,
    questions = null,
    quoteRequestedAt = null,
    status,
    stub = null,
    summary = null,
    timerStartedAt = null,
    updatedOffsetMs,
}: {
    answers?: string[] | null
    createdOffsetMs: number
    name: string
    pdfUrl?: string | null
    questions?: string[] | null
    quoteRequestedAt?: string | null
    status: Proposal['status']
    stub?: string | null
    summary?: string | null
    timerStartedAt?: string | null
    updatedOffsetMs: number
}): Proposal => ({
    answers,
    createdAt: new Date(now - createdOffsetMs)
        .toISOString(),
    id: uuidv4(),
    name,
    pdfUrl,
    questions,
    quoteRequestedAt,
    status,
    stub,
    summary,
    timerStartedAt,
    updatedAt: new Date(now - updatedOffsetMs)
        .toISOString(),
})

const createDocument = (
    proposalId: string,
    fileName: string,
    fileType: string,
    fileSize: number,
): ProposalDocument => ({
    fileName,
    fileSize,
    fileType,
    id: uuidv4(),
    proposalId,
    uploadedAt: new Date(now)
        .toISOString(),
})

const delay = (ms: number): Promise<void> => new Promise(resolve => {
    setTimeout(resolve, ms)
})

const throwError = (statusCode: number, message: string): never => {
    const error = new Error(message) as Error & { status: number, statusCode: number }
    error.status = statusCode
    error.statusCode = statusCode
    throw error
}

const activeAssessmentStartedAt = new Date(now - (15 * 60 - 30) * 1000)
    .toISOString()
const warningAssessmentStartedAt = new Date(now - (15 * 60 - 135) * 1000)
    .toISOString()
const expiredAssessmentStartedAt = new Date(now - 20 * 60 * 1000)
    .toISOString()
const requestedQuoteAt = new Date(now - 2 * 60 * 60 * 1000)
    .toISOString()
const mockPdfUrl = '/rfp-tool/mock-proposal.pdf'
const nearLimitSummary = Array.from(
    { length: 995 },
    (_, index) => `summary${index + 1}`,
)
    .join(' ')

const draftProposal = createProposal({
    createdOffsetMs: 11 * 24 * 60 * 60 * 1000,
    name: 'Draft Proposal',
    status: 'DRAFT',
    updatedOffsetMs: 11 * 24 * 60 * 60 * 1000,
})

const freshEmptyProposal = createProposal({
    createdOffsetMs: 10 * 24 * 60 * 60 * 1000,
    name: 'Fresh Empty Proposal',
    status: 'DRAFT',
    updatedOffsetMs: 10 * 24 * 60 * 60 * 1000,
})

const draftWithDocsProposal = createProposal({
    createdOffsetMs: 9 * 24 * 60 * 60 * 1000,
    name: 'Draft With Docs',
    status: 'DRAFT',
    updatedOffsetMs: 8 * 24 * 60 * 60 * 1000,
})

const reassessCandidateProposal = createProposal({
    answers: [
        'Budget allocated for a restart scenario.',
        'Timeline can be re-baselined this quarter.',
        'Updated scope, delivery plan, and risk log.',
        'Program leadership and procurement.',
        'Contracting and security review are required.',
    ],
    createdOffsetMs: 8 * 24 * 60 * 60 * 1000,
    name: 'Reassess Candidate',
    pdfUrl: mockPdfUrl,
    questions: [...ASSESSMENT_QUESTIONS],
    status: 'COMPLETED',
    stub: 'Assessment complete',
    summary: 'Previously completed proposal intended for restart-from-build testing.',
    updatedOffsetMs: 7 * 24 * 60 * 60 * 1000,
})

const maxDocumentsProposal = createProposal({
    createdOffsetMs: 7 * 24 * 60 * 60 * 1000,
    name: 'Max Documents',
    status: 'DRAFT',
    summary: 'Proposal seeded with the maximum allowed number of uploaded files.',
    updatedOffsetMs: 6 * 24 * 60 * 60 * 1000,
})

const largeSummaryCaseProposal = createProposal({
    createdOffsetMs: 6 * 24 * 60 * 60 * 1000,
    name: 'Large Summary Case',
    status: 'DRAFT',
    summary: nearLimitSummary,
    updatedOffsetMs: 5 * 24 * 60 * 60 * 1000,
})

const assessedExpiredProposal = createProposal({
    answers: null,
    createdOffsetMs: 5 * 24 * 60 * 60 * 1000,
    name: 'Assessed Expired',
    questions: [...ASSESSMENT_QUESTIONS],
    status: 'ASSESSED',
    stub: 'Assessment complete',
    summary: 'Assessment complete, but the clarifying context window has already expired.',
    timerStartedAt: expiredAssessmentStartedAt,
    updatedOffsetMs: 20 * 60 * 1000,
})

const assessedWarningProposal = createProposal({
    answers: null,
    createdOffsetMs: 4 * 24 * 60 * 60 * 1000,
    name: 'Assessed Warning',
    questions: [...ASSESSMENT_QUESTIONS],
    status: 'ASSESSED',
    stub: 'Assessment complete',
    summary: 'Assessment complete and inside the warning window before context expiry.',
    timerStartedAt: warningAssessmentStartedAt,
    updatedOffsetMs: 12 * 60 * 1000 + 30 * 1000,
})

const assessedActiveProposal = createProposal({
    answers: null,
    createdOffsetMs: 3 * 24 * 60 * 60 * 1000,
    name: 'Assessed Active',
    questions: [...ASSESSMENT_QUESTIONS],
    status: 'ASSESSED',
    stub: 'Assessment complete',
    summary: 'Assessment complete and the clarifying questions are actively awaiting answers.',
    timerStartedAt: activeAssessmentStartedAt,
    updatedOffsetMs: 14 * 60 * 1000 + 30 * 1000,
})

const completedProposal = createProposal({
    answers: [
        'Budget approved by finance.',
        'Delivery in Q3.',
        'Implementation, training, and reporting.',
        'Operations and procurement stakeholders.',
        'SOC 2 and internal procurement compliance apply.',
    ],
    createdOffsetMs: 2 * 24 * 60 * 60 * 1000,
    name: 'Completed Proposal',
    pdfUrl: mockPdfUrl,
    questions: [...ASSESSMENT_QUESTIONS],
    status: 'COMPLETED',
    stub: 'Assessment complete',
    summary: 'A fully completed proposal with generated PDF.',
    updatedOffsetMs: 60 * 60 * 1000,
})

const quoteRequestedProposal = createProposal({
    answers: [
        'Budget pending final signoff.',
        'Delivery requested within 90 days.',
        'Migration, onboarding, and support.',
        'Executive sponsors and delivery leads.',
        'Standard security and data retention policies apply.',
    ],
    createdOffsetMs: 24 * 60 * 60 * 1000,
    name: 'Quote Requested',
    pdfUrl: mockPdfUrl,
    questions: [...ASSESSMENT_QUESTIONS],
    quoteRequestedAt: requestedQuoteAt,
    status: 'QUOTE_REQUESTED',
    stub: 'Assessment complete',
    summary: 'Completed proposal with a quote already requested.',
    updatedOffsetMs: 2 * 60 * 60 * 1000,
})

const benchmarkingUtilProposal = createProposal({
    createdOffsetMs: 24 * 60 * 60 * 1000,
    name: 'Benchmarking Util',
    status: 'DRAFT',
    updatedOffsetMs: 24 * 60 * 60 * 1000,
})

const myTestProposal = createProposal({
    createdOffsetMs: 12 * 60 * 60 * 1000,
    name: 'My Test Proposal',
    status: 'DRAFT',
    updatedOffsetMs: 12 * 60 * 60 * 1000,
})

const initialProposals: Proposal[] = [
    draftProposal,
    freshEmptyProposal,
    draftWithDocsProposal,
    reassessCandidateProposal,
    maxDocumentsProposal,
    largeSummaryCaseProposal,
    assessedExpiredProposal,
    assessedWarningProposal,
    assessedActiveProposal,
    completedProposal,
    quoteRequestedProposal,
    benchmarkingUtilProposal,
    myTestProposal,
]

const initialDocumentsStore: Record<string, ProposalDocument[]> = {
    [assessedActiveProposal.id]: [
        createDocument(assessedActiveProposal.id, 'Overview.docx', '.docx', 25000),
        createDocument(assessedActiveProposal.id, 'Budget.txt', '.txt', 15000),
        createDocument(assessedActiveProposal.id, 'SystemReqs.pdf', '.pdf', 45000),
        createDocument(assessedActiveProposal.id, 'FeatureList.docx', '.docx', 32000),
        createDocument(assessedActiveProposal.id, 'FeatureListAddl.docx', '.docx', 18000),
        createDocument(assessedActiveProposal.id, 'Notes.txt', '.txt', 8000),
    ],
    [assessedExpiredProposal.id]: [
        createDocument(assessedExpiredProposal.id, 'LegacyRequirements.pdf', '.pdf', 54000),
        createDocument(assessedExpiredProposal.id, 'ComplianceNotes.txt', '.txt', 11000),
    ],
    [assessedWarningProposal.id]: [
        createDocument(assessedWarningProposal.id, 'Requirements-v2.pdf', '.pdf', 51000),
        createDocument(assessedWarningProposal.id, 'UserVolumes.txt', '.txt', 7000),
    ],
    [draftWithDocsProposal.id]: [
        createDocument(draftWithDocsProposal.id, 'RFPOverview.docx', '.docx', 22000),
        createDocument(draftWithDocsProposal.id, 'ProjectNotes.txt', '.txt', 9000),
        createDocument(draftWithDocsProposal.id, 'Requirements.pdf', '.pdf', 38000),
    ],
    [maxDocumentsProposal.id]: [
        createDocument(maxDocumentsProposal.id, 'Doc01.pdf', '.pdf', 12000),
        createDocument(maxDocumentsProposal.id, 'Doc02.docx', '.docx', 14000),
        createDocument(maxDocumentsProposal.id, 'Doc03.txt', '.txt', 6000),
        createDocument(maxDocumentsProposal.id, 'Doc04.pdf', '.pdf', 17000),
        createDocument(maxDocumentsProposal.id, 'Doc05.doc', '.doc', 13000),
        createDocument(maxDocumentsProposal.id, 'Doc06.docx', '.docx', 20000),
        createDocument(maxDocumentsProposal.id, 'Doc07.txt', '.txt', 5000),
        createDocument(maxDocumentsProposal.id, 'Doc08.pdf', '.pdf', 21000),
        createDocument(maxDocumentsProposal.id, 'Doc09.docx', '.docx', 15000),
        createDocument(maxDocumentsProposal.id, 'Doc10.txt', '.txt', 4000),
    ],
    [largeSummaryCaseProposal.id]: [
        createDocument(largeSummaryCaseProposal.id, 'SummaryInputs.pdf', '.pdf', 26000),
    ],
    [reassessCandidateProposal.id]: [
        createDocument(reassessCandidateProposal.id, 'SubmittedProposal.pdf', '.pdf', 80000),
        createDocument(reassessCandidateProposal.id, 'ScopeMatrix.docx', '.docx', 24000),
    ],
    [completedProposal.id]: [
        createDocument(completedProposal.id, 'ApprovedProposal.pdf', '.pdf', 76000),
    ],
    [quoteRequestedProposal.id]: [
        createDocument(quoteRequestedProposal.id, 'FinalProposal.pdf', '.pdf', 82000),
        createDocument(quoteRequestedProposal.id, 'CommercialAppendix.docx', '.docx', 18000),
    ],
}

const cloneDocumentsStore = (
    store: Record<string, ProposalDocument[]>,
): Record<string, ProposalDocument[]> => Object.fromEntries(
    Object.entries(store)
        .map(([proposalId, documents]) => [proposalId, [...documents]]),
)

export const proposalsStore: Proposal[] = [...initialProposals]

export const documentsStore: Record<string, ProposalDocument[]> = cloneDocumentsStore(initialDocumentsStore)

export const generateMockPdfUrl = (proposalId: string): string => `${mockPdfUrl}?proposalId=${proposalId}`

export const resetMockStores = (): void => {
    proposalsStore.splice(0, proposalsStore.length, ...initialProposals)

    Object.keys(documentsStore)
        .forEach(key => {
            delete documentsStore[key]
        })

    Object.assign(documentsStore, cloneDocumentsStore(initialDocumentsStore))
}

export const mockHandlers = {

    answerQuestions: async (
        proposalId: string,
        body: AnswerQuestionsRequest,
    ): Promise<AnswerQuestionsResponse> => {
        const proposal = proposalsStore.find(p => p.id === proposalId)
        if (!proposal) {
            throwError(404, 'Proposal not found')
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const proposalData = proposal!

        if (proposalData.status !== 'ASSESSED') {
            throwError(400, 'Proposal must be in ASSESSED status')
        }

        if (!proposalData.timerStartedAt) {
            throwError(400, 'Proposal must be assessed first')
        }

        const timerStartedAt = proposalData.timerStartedAt as string
        const timerStartTime = new Date(timerStartedAt)
            .getTime()
        const elapsedMs = Date.now() - timerStartTime

        if (elapsedMs > TIMER_DURATION_MS) {
            throwError(408, 'The assessment context has expired. Please re-assess the proposal.')
        }

        if (!body.answers || body.answers.length === 0) {
            throwError(400, 'Answers are required')
        }

        await delay(MOCK_DELAYS.ANSWER_QUESTIONS)

        const pdfUrl = generateMockPdfUrl(proposalId)
        const nowIso = new Date()
            .toISOString()

        proposalData.status = 'COMPLETED'
        proposalData.answers = [...body.answers]
        proposalData.pdfUrl = pdfUrl
        proposalData.timerStartedAt = null
        proposalData.updatedAt = nowIso

        return { pdfUrl }
    },

    assessProposal: async (
        proposalId: string,
        body: AssessProposalRequest,
    ): Promise<AssessProposalResponse> => {
        const proposal = proposalsStore.find(p => p.id === proposalId)
        if (!proposal) {
            throwError(404, 'Proposal not found')
        }

        const wordCount = getWordCount(body.summary)
        if (wordCount > MAX_SUMMARY_WORDS) {
            throwError(400, 'Summary must not exceed 1000 words')
        }

        await delay(MOCK_DELAYS.ASSESS_PROPOSAL)

        const nowIso = new Date()
            .toISOString()
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const proposalData = proposal!
        proposalData.status = 'ASSESSED'
        proposalData.answers = null
        proposalData.pdfUrl = null
        proposalData.questions = [...ASSESSMENT_QUESTIONS]
        proposalData.quoteRequestedAt = null
        proposalData.stub = 'Assessment complete'
        proposalData.summary = body.summary
        proposalData.timerStartedAt = nowIso
        proposalData.updatedAt = nowIso

        return {
            questions: [...ASSESSMENT_QUESTIONS],
            stub: 'Assessment complete',
            timerStartedAt: nowIso,
        }
    },

    createProposal: async (body: CreateProposalRequest): Promise<Proposal> => {
        if (!body.name || body.name.trim().length === 0) {
            throwError(400, 'Proposal name is required')
        }

        await delay(MOCK_DELAYS.CREATE_PROPOSAL)

        const newProposal: Proposal = {
            answers: null,
            createdAt: new Date()
                .toISOString(),
            id: uuidv4(),
            name: body.name,
            pdfUrl: null,
            questions: null,
            quoteRequestedAt: null,
            status: 'DRAFT',
            stub: null,
            summary: null,
            timerStartedAt: null,
            updatedAt: new Date()
                .toISOString(),
        }

        proposalsStore.push(newProposal)
        return newProposal
    },

    getDocuments: async (proposalId: string): Promise<ProposalDocument[]> => {
        const proposal = proposalsStore.find(p => p.id === proposalId)
        if (!proposal) {
            throwError(404, 'Proposal not found')
        }

        return documentsStore[proposalId] || []
    },

    getProposals: async (): Promise<ProposalsListResponse> => {
        await delay(MOCK_DELAYS.GET_PROPOSALS)

        const sorted = [...proposalsStore].sort(
            (a, b) => new Date(b.updatedAt)
                .getTime() - new Date(a.updatedAt)
                .getTime(),
        )

        return { proposals: sorted }
    },

    requestQuote: async (proposalId: string): Promise<RequestQuoteResponse> => {
        const proposal = proposalsStore.find(p => p.id === proposalId)
        if (!proposal) {
            throwError(404, 'Proposal not found')
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const proposalData = proposal!

        if (proposalData.status === 'QUOTE_REQUESTED') {
            throwError(400, 'Quote has already been requested for this proposal')
        }

        if (proposalData.status !== 'COMPLETED') {
            throwError(400, 'Proposal must be in COMPLETED status')
        }

        await delay(MOCK_DELAYS.REQUEST_QUOTE)

        const nowIso = new Date()
            .toISOString()
        proposalData.status = 'QUOTE_REQUESTED'
        proposalData.quoteRequestedAt = nowIso
        proposalData.updatedAt = nowIso

        return {
            id: proposalId,
            quoteRequestedAt: nowIso,
            status: 'QUOTE_REQUESTED',
        }
    },

    uploadDocuments: async (proposalId: string, files: File[]): Promise<ProposalDocument[]> => {
        const proposal = proposalsStore.find(p => p.id === proposalId)
        if (!proposal) {
            throwError(404, 'Proposal not found')
        }

        const existingDocs = documentsStore[proposalId] || []
        const totalCount = existingDocs.length + files.length

        if (totalCount > MAX_FILES_PER_PROPOSAL) {
            throwError(400, 'Maximum of 10 documents per proposal exceeded')
        }

        for (const file of files) {
            const ext = getFileExtension(file.name)

            if (!ALLOWED_FILE_TYPES.includes(ext)) {
                throwError(400, 'File type not allowed. Accepted types: .pdf, .doc, .docx, .txt')
            }

            if (file.size > MAX_FILE_SIZE) {
                throwError(400, 'File exceeds maximum size of 5MB')
            }
        }

        await delay(MOCK_DELAYS.UPLOAD_DOCUMENTS)

        const newDocuments: ProposalDocument[] = files.map(file => ({
            fileName: file.name,
            fileSize: file.size,
            fileType: getFileExtension(file.name),
            id: uuidv4(),
            proposalId,
            uploadedAt: new Date()
                .toISOString(),
        }))

        if (!documentsStore[proposalId]) {
            documentsStore[proposalId] = []
        }

        documentsStore[proposalId].push(...newDocuments)

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        proposal!.updatedAt = new Date()
            .toISOString()

        return [...documentsStore[proposalId]]
    },

}

export type MockHandlers = typeof mockHandlers
