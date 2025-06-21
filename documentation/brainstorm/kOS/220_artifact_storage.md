# 220: Artifact Storage & Retrieval System – Uploads, Indexing, Hosting, and Expiry Logic

## Overview
The Artifact Storage & Retrieval System handles all media and file assets ("artifacts") produced, referenced, or used by the kAI ecosystem. It supports local and remote storage backends, metadata tagging, retrieval strategies, caching, and expiration for automated cleanup.

Artifacts include:
- LLM-generated media (images, audio, video, markdown, PDFs, etc.)
- Uploaded user content (documents, datasets, recordings)
- Logs, transcriptions, snapshots, backup prompts, session exports
- Execution results, agent memory archives, diagnostics

This system ensures reliable storage, discoverability, integrity, and lifecycle management.

---

## Directory Structure
```
kos-core/
  services/
    artifacts/
      api/
        index.ts
        uploadArtifact.ts
        getArtifact.ts
        deleteArtifact.ts
      lib/
        artifactStore.ts
        artifactConfig.ts
        indexer.ts
        expiry.ts
        metadata.ts
      types/
        index.ts
        artifact.ts
      adapters/
        local.ts
        s3.ts
        ipfs.ts
        firebase.ts
```

---

## Configuration (`artifactConfig.ts`)
```ts
export const artifactConfig = {
  storageProvider: 'local', // 's3' | 'ipfs' | 'firebase' also supported
  rootDir: './data/artifacts/',
  maxFileSizeMB: 500,
  expiryPolicyDays: 30,
  enableHashDeduplication: true,
  enablePreviewGeneration: true,
};
```

---

## Types
### `Artifact`
```ts
interface Artifact {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'document' | 'code' | 'text';
  size: number;
  hash: string;
  metadata: Record<string, any>;
  tags: string[];
  createdAt: Date;
  expiresAt?: Date;
  sourceAgent?: string;
  path: string;
}
```

---

## Upload Endpoint (`uploadArtifact.ts`)
```ts
POST /api/artifacts/upload
Body: Multipart form data
- file: (binary)
- tags: string[] (optional)
- sourceAgent: string (optional)

Response:
{
  id: string;
  previewUrl: string;
  expiresAt: string;
}
```

---

## Storage Adapters
### Local Filesystem (`local.ts`)
- Stores in `artifactConfig.rootDir`
- Filenames hashed with SHA-256
- Uses subdirectories by MIME type
- Static hosting via Nginx/Caddy at `/artifacts/`

### S3 Adapter
- Bucket config: `KIND_S3_BUCKET`, `REGION`, `ACCESS_KEY`, `SECRET`
- URL signing support for private artifacts

### IPFS Adapter
- Supports both local node and public gateway pinning
- Content addressing via CID

### Firebase Adapter
- Uses Firebase Storage SDK
- Best for mobile and hybrid cloud environments

---

## Indexer (`indexer.ts`)
- Maintains SQLite/Redis index of artifact metadata
- Full-text search via `name`, `tags`, `sourceAgent`, `type`
- Supports tag-based filters and date range queries
- Can return usage frequency and sort by recency/importance

---

## Expiry Engine (`expiry.ts`)
- Runs scheduled daily cleanup task
- Deletes expired artifacts based on `expiresAt`
- Optional archive-to-IPFS or S3 Glacier
- Admin override to extend or protect certain artifacts

---

## Agent Access Layer
Agents can access and manage artifacts via:
- Direct API calls
- Helper functions (`artifactStore.get(id)`, `store.upload(blob)`)
- Prompt injection (`{{load:artifact:<id>}}`)
- ArtifactPreviewCard in frontend UIs

---

## Security
- Virus scan on upload (ClamAV or external)
- File type validation (MIME/type matching)
- SHA-256 fingerprinting for duplicate detection
- Role-based access: viewer/editor/owner
- Expiring signed URLs for S3/IPFS private access

---

## UI Components (for kAI/kOS Dashboards)
- `ArtifactPreviewCard`
- `ArtifactListView`
- `ArtifactUploadForm`
- `ArtifactDetailModal`
- `DownloadAllArtifactsButton`

---

## TODO (Future Enhancements)
- User-defined retention policies
- Artifact bundling and export packs
- Integration with prompt and session managers
- Archive compression and checksum auditing
- Webhooks for post-upload actions
- ML-based tagging & similarity detection

---

### Changelog
- 2025-06-20 • Initial complete draft

