/**
 * DocumentsPanel component
 * Allows uploading documents for the proposal
 */

import type { FC } from 'react'
import { useState } from 'react'
import { toast } from 'react-toastify'

import { InputFilePicker, LoadingSpinner } from '~/libs/ui'

import { useDocuments } from '../../hooks'
import { validateFiles } from '../../utils/validation'
import { formatDateTime, formatFileSize } from '../../utils/formatting'
import { uploadDocumentsThunk, useRfpToolDispatch, useRfpToolSelector } from '../../../redux'

import styles from './BuildTab.module.scss'

const toastOptions = {
    position: toast.POSITION.BOTTOM_RIGHT,
} as const

export interface DocumentsPanelProps {
    proposalId: string | undefined
}

/**
 * DocumentsPanel renders the file upload section
 */
export const DocumentsPanel: FC<DocumentsPanelProps> = props => {
    const dispatch = useRfpToolDispatch()
    const [pickerResetKey, setPickerResetKey] = useState(0)
    const documentsState = useDocuments(props.proposalId)
    const documents = documentsState.documents
    const isLoading = documentsState.isLoading
    const setDocuments = documentsState.setDocuments
    const isUploading = useRfpToolSelector(state => state.mutations.uploadDocuments)

    function resetPicker(): void {
        setPickerResetKey(currentKey => currentKey + 1)
    }

    async function handleFileSelect(fileList: FileList | undefined): Promise<void> {
        if (!props.proposalId || !fileList) return

        const files = Array.from(fileList)
        if (files.length === 0) return

        // Validate files
        const errors = validateFiles(files, documents.length)
        if (errors.length > 0) {
            toast.error(errors[0], toastOptions)
            resetPicker()
            return
        }

        try {
            const allDocuments = await dispatch(uploadDocumentsThunk(props.proposalId, files))
            setDocuments(allDocuments)
            resetPicker()
            toast.success('Documents uploaded successfully', toastOptions)
        } catch (err) {
            const error = err as { status?: number; message?: string }
            const status = error?.status
            const errorMessage = status === undefined
                ? 'Unable to connect to the server. Please check your connection.'
                : status >= 500
                    ? 'Something went wrong. Please try again later.'
                    : error.message ?? 'Upload failed'
            toast.error(errorMessage, toastOptions)
            resetPicker()
        }
    }

    if (!props.proposalId) {
        return (
            <div className={styles.panel}>
                <h3 className={styles.panelHeader}>Documents</h3>
                <div className={styles.emptyState}>Select a proposal to manage documents</div>
            </div>
        )
    }

    return (
        <div className={styles.panel}>
            <h3 className={styles.panelHeader}>
                {`Documents (${documents.length}/10)`}
            </h3>
            <div className={styles.panelContent}>
                {/* 9.2: Show spinner during refresh even when cached documents exist */}
                {isLoading && <LoadingSpinner />}

                {/* Documents list */}
                {documents.length > 0 && (
                    <div className={styles.documentsList}>
                        {documents.map(doc => (
                            <div key={doc.id} className={styles.documentItem}>
                                <span className={styles.documentName}>{doc.fileName}</span>
                                <span className={styles.documentMeta}>
                                    {formatFileSize(doc.fileSize)}
                                    {' · '}
                                    {formatDateTime(doc.uploadedAt)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {isUploading && <LoadingSpinner inline message='Uploading...' />}

                {/* Upload button */}
                {!isUploading && documents.length < 10 && (
                    <InputFilePicker
                        key={`${props.proposalId}-${pickerResetKey}`}
                        name='documents'
                        onChange={handleFileSelect}
                        fileConfig={{
                            acceptFileType: '.pdf,.doc,.docx,.txt',
                        }}
                    />
                )}
            </div>
        </div>
    )
}
