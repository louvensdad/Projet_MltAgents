export interface DownloadInfoResponse {
  project_id: string;
  project_name: string;
  file_name: string;
  file_size_bytes: number;
  file_size_human: string;
  file_count: number;
  sha256: string;
  security_status: "passed" | "failed";
  message: string;
  generated_with: string;
}
