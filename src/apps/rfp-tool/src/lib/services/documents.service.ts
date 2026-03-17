import type {
    ProposalDocument,
    UploadDocumentsResponse,
} from '../models'
import { EnvironmentConfig } from '~/config'
import {
    xhrGetAsync,
    xhrPostAsync,
} from '~/libs/core'

const RFP_TOOL_API_BASE: string =
    process.env.REACT_APP_RFP_TOOL_API
    || (EnvironmentConfig.ENV === 'local' ? 'http://localhost:3000' : EnvironmentConfig.API.URL)

const normalizeDocument = (document: ProposalDocument): ProposalDocument => ({
    ...document,
})

export const getDocuments = async (
    proposalId: string,
): Promise<ProposalDocument[]> => {
    const response = await xhrGetAsync<ProposalDocument[] | { documents: ProposalDocument[] }>(
        `${RFP_TOOL_API_BASE}/proposals/${proposalId}/documents`,
    )

    const documents: ProposalDocument[] = Array.isArray(response)
        ? response
        : response.documents

    if (!Array.isArray(documents)) {
        throw new Error('Unexpected get documents response shape')
    }

    return documents.map(normalizeDocument)
}

export const uploadDocuments = async (
    proposalId: string,
    files: File[],
): Promise<ProposalDocument[]> => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    const response = await xhrPostAsync<FormData, UploadDocumentsResponse | ProposalDocument[]>(
        `${RFP_TOOL_API_BASE}/proposals/${proposalId}/documents`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
    )

    const uploadedDocuments: ProposalDocument[] = Array.isArray(response)
        ? response
        : response.documents

    if (!Array.isArray(uploadedDocuments)) {
        throw new Error('Unexpected upload documents response shape')
    }

    return uploadedDocuments.map(normalizeDocument)
}
