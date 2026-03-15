/**
 * ProposalDocument data model
 */

export interface ProposalDocument {
    id: string // UUID
    proposalId: string // Foreign key to Proposal
    fileName: string
    fileSize: number // Size in bytes
    fileType: string // MIME type or extension
    uploadedAt: string // ISO timestamp
}

/**
 * Response from uploading documents
 * Returns all documents for the proposal
 */
export interface UploadDocumentsResponse {
    documents: ProposalDocument[]
}
