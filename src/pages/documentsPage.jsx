import { useEffect, useState } from "react";
import {
  getAllAttachments,
  deleteAttachment,
  getAttachmentDownloadUrl,
} from "../services/api/attachmentApi";
import { formatDateTimeTR } from "../utils/date";

function DocumentsPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadFiles = async () => {
    try {
      setLoading(true);

      const data = await getAllAttachments();
      console.log("GELEN DOSYALAR:", data);

      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Dosyalar alınamadı:", err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu dosyayı silmek istiyor musun?")) return;

    try {
      await deleteAttachment(id);
      await loadFiles();
    } catch (err) {
      console.error("Dosya silinemedi:", err);
      alert("Dosya silinirken bir hata oluştu.");
    }
  };

  const formatFileSize = (size) => {
    if (!size) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (contentType) => {
    if (!contentType) return "📎";
    if (contentType.includes("pdf")) return "📄";
    if (contentType.startsWith("image/")) return "🖼️";
    if (contentType.includes("word")) return "📝";
    if (contentType.includes("excel") || contentType.includes("spreadsheet"))
      return "📊";
    return "📎";
  };

  const getFileName = (file) => {
    return (
      file.originalFileName ||
      file.fileName ||
      file.name ||
      file.path ||
      file.filePath ||
      "-"
    );
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const filteredFiles = files.filter((file) =>
    getFileName(file).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Documents</h2>
      <p className="text-muted">Sisteme yüklenen tüm dosyalar</p>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Dosya adına göre ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading ? (
            <p>Dosyalar yükleniyor...</p>
          ) : filteredFiles.length === 0 ? (
            <p className="text-muted mb-0">
              {search ? "Aramaya uygun dosya bulunamadı." : "Henüz dosya yok."}
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Dosya</th>
                    <th>Bağlı Job</th>
                    <th>Tür</th>
                    <th>Boyut</th>
                    <th>Yüklenme Tarihi</th>
                    <th className="text-end">İşlem</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFiles.map((file) => (
                    <tr key={file.id}>
                      <td>
                        <span className="me-2">
                          {getFileIcon(file.contentType)}
                        </span>
                        {getFileName(file)}
                      </td>

                      <td>{file.jobTitle || "-"}</td>
                      <td>{file.contentType || "-"}</td>
                      <td>{formatFileSize(file.size)}</td>
                      <td>{formatDateTimeTR(file.uploadedAt)}</td>

                      <td className="text-end">
                        <a
                          href={getAttachmentDownloadUrl(file.id)}
                          className="btn btn-sm btn-outline-primary me-2"
                          target="_blank"
                          rel="noreferrer"
                        >
                          İndir
                        </a>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(file.id)}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentsPage;