import { Capacitor, registerPlugin } from '@capacitor/core'
import { serverAttachmentUrl } from './http'

export interface ExportableFile {
  url: string
  fileName: string
}

interface FileExporterPlugin {
  exportFiles(options: { files: ExportableFile[]; authorization?: string }): Promise<{
    saved: number
    failed: number
    cancelled: boolean
  }>
}

const FileExporter = registerPlugin<FileExporterPlugin>('FileExporter')

export function canExportFilesNatively(): boolean {
  return Capacitor.getPlatform() === 'ios'
}

export async function exportFilesNatively(files: ExportableFile[]): Promise<{
  saved: number
  failed: number
  cancelled: boolean
}> {
  const token = localStorage.getItem('token')
  return FileExporter.exportFiles({
    files: files.map(file => ({ ...file, url: serverAttachmentUrl(file.url) })),
    authorization: token ? `Bearer ${token}` : undefined,
  })
}
