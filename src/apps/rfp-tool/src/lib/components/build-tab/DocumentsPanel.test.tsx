import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { ProposalDocument } from '../../models'

import { DocumentsPanel } from './DocumentsPanel'

const mockDispatch = jest.fn()
const mockToastError = jest.fn()
const mockToastSuccess = jest.fn()
const mockSetDocuments = jest.fn()
const mockUseSelector = jest.fn()
const mockUseDocuments = jest.fn()

jest.mock('react-toastify', () => ({
    toast: {
        POSITION: {
            BOTTOM_RIGHT: 'bottom-right',
        },
        error: (...args: unknown[]) => mockToastError(...args),
        success: (...args: unknown[]) => mockToastSuccess(...args),
    },
}))

jest.mock('../../../redux', () => ({
    uploadDocumentsThunk: (proposalId: string, files: File[]) => ({
        payload: { files, proposalId },
        type: 'uploadDocumentsThunk',
    }),
    useRfpToolDispatch: () => mockDispatch,
    useRfpToolSelector: (selector: (state: { mutations: { uploadDocuments: boolean } }) => boolean) => (
        mockUseSelector(selector)
    ),
}))

jest.mock('../../hooks', () => ({
    useDocuments: (proposalId: string | undefined) => mockUseDocuments(proposalId),
}))

jest.mock('~/libs/ui', () => ({
    InputFilePicker: ({
        name,
        onChange,
    }: {
        name: string
        onChange: (files: FileList | undefined) => void
    }) => (
        <input
            aria-label={name}
            type='file'
            onChange={event => onChange(event.currentTarget.files ?? undefined)}
        />
    ),
}), { virtual: true })

const documents: ProposalDocument[] = [
    {
        id: 'doc-1',
        fileName: 'challenge-1-frontend.pdf',
        fileSize: 1024,
        fileType: '.pdf',
        proposalId: 'proposal-1',
        uploadedAt: '2026-02-28T12:00:00.000Z',
    },
]

describe('DocumentsPanel', () => {
    beforeEach(() => {
        mockDispatch.mockReset()
        mockToastError.mockReset()
        mockToastSuccess.mockReset()
        mockSetDocuments.mockReset()
        mockUseSelector.mockImplementation((selector: (state: { mutations: { uploadDocuments: boolean } }) => boolean) => (
            selector({ mutations: { uploadDocuments: false } })
        ))
        mockUseDocuments.mockReturnValue({
            documents,
            isLoading: false,
            setDocuments: mockSetDocuments,
        })
    })

    it('renders the document count and uploaded document names', () => {
        render(<DocumentsPanel proposalId='proposal-1' />)

        expect(screen.getByText('Documents (1/10)'))
            .toBeInTheDocument()
        expect(screen.getByText('challenge-1-frontend.pdf'))
            .toBeInTheDocument()
    })

    it('uploads a valid document and refreshes the local document list', async () => {
        const uploadedDocuments: ProposalDocument[] = [
            ...documents,
            {
                id: 'doc-2',
                fileName: 'overview.docx',
                fileSize: 2048,
                fileType: '.docx',
                proposalId: 'proposal-1',
                uploadedAt: '2026-02-28T12:05:00.000Z',
            },
        ]
        const file = new File(['demo'], 'overview.docx', {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })

        mockDispatch.mockResolvedValue(uploadedDocuments)

        render(<DocumentsPanel proposalId='proposal-1' />)

        fireEvent.change(screen.getByLabelText('documents'), {
            target: { files: [file] },
        })

        await waitFor(() => {
            expect(mockDispatch)
                .toHaveBeenCalledWith({
                    payload: { files: [file], proposalId: 'proposal-1' },
                    type: 'uploadDocumentsThunk',
                })
        })

        await waitFor(() => {
            expect(mockSetDocuments)
                .toHaveBeenCalledWith(uploadedDocuments)
            expect(mockToastSuccess)
                .toHaveBeenCalledWith(
                    'Documents uploaded successfully',
                    { position: 'bottom-right' },
                )
        })
    })

    it('shows a validation error for unsupported document types', async () => {
        const invalidFile = new File(['demo'], 'malware.exe', {
            type: 'application/octet-stream',
        })

        render(<DocumentsPanel proposalId='proposal-1' />)

        fireEvent.change(screen.getByLabelText('documents'), {
            target: { files: [invalidFile] },
        })

        await waitFor(() => {
            expect(mockToastError)
                .toHaveBeenCalledWith(
                    'File type not allowed. Accepted types: .pdf, .doc, .docx, .txt',
                    { position: 'bottom-right' },
                )
        })

        expect(mockDispatch)
            .not.toHaveBeenCalled()
        expect(mockSetDocuments)
            .not.toHaveBeenCalled()
    })

    it('shows a validation error for files larger than 5MB', async () => {
        const oversizedFile = new File(['demo'], 'huge.pdf', {
            type: 'application/pdf',
        })

        Object.defineProperty(oversizedFile, 'size', {
            configurable: true,
            value: 6 * 1024 * 1024,
        })

        render(<DocumentsPanel proposalId='proposal-1' />)

        fireEvent.change(screen.getByLabelText('documents'), {
            target: { files: [oversizedFile] },
        })

        await waitFor(() => {
            expect(mockToastError)
                .toHaveBeenCalledWith(
                    'File exceeds maximum size of 5MB',
                    { position: 'bottom-right' },
                )
        })

        expect(mockDispatch)
            .not.toHaveBeenCalled()
        expect(mockSetDocuments)
            .not.toHaveBeenCalled()
    })
})
