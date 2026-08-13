export interface SignedUploadResponse {
  msg: string
  uploadUrl: string
  fileUrl: string
  objectName: string
  fileName: string
  contentType: string
  size: number
  requiredUploadHeaders: {
      "Content-Type": string
      "X-Goog-Content-Length-Range": string
  }
}

export const requestSignedUploadUrl = async (
  channelId: string,
  file: File,
): Promise<SignedUploadResponse> => {
  const response = await fetch(`${import.meta.env.VITE_API}/channels/${channelId}/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.msg || "Upload failed")
  }

  return data as SignedUploadResponse
}

export const uploadFileToSignedUrl = async (uploadUrl: string, file: File, requiredUploadHeaders: { "Content-Type": string; "X-Goog-Content-Length-Range": string }) => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      // "Content-Type": file.type || "application/octet-stream",
      ...requiredUploadHeaders
    },
    body: file,
  })

  if (!response.ok) {
    throw new Error("Failed to upload file to storage")
  }
}
