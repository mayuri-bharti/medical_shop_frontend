import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { getAccessToken, getAdminToken } from "../lib/api";
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  ShieldCheck,
  Image,
  Calendar,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import prescriptionPlaceholder from "../images/prescription.webp";

// Helper to get file URL with Cloudinary optimization
const getFileUrl = (fileUrl, prescriptionId) => {
  if (!fileUrl) return "";

  // If it's already a full URL (Cloudinary), return it
  if (fileUrl.startsWith("http")) {
    // If it's a Cloudinary URL, add optimization parameters
    if (fileUrl.includes("cloudinary.com")) {
      // Add Cloudinary transformations for better performance
      const separator = fileUrl.includes("?") ? "&" : "?";
      return `${fileUrl}${separator}f_auto,q_auto`;
    }
    return fileUrl;
  }

  // Local file - prefer API route for authenticated access
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

  // Use the secure API route if we have prescription ID
  if (prescriptionId) {
    // Get token for query parameter (needed for <img> tags)
    const token = getAdminToken() || getAccessToken();

    if (token) {
      return `${apiBaseUrl}/prescriptions/${prescriptionId}/file?token=${encodeURIComponent(
        token
      )}`;
    }

    // Fallback without token (will fail auth but try anyway)
    return `${apiBaseUrl}/prescriptions/${prescriptionId}/file`;
  }

  // Fallback: try direct static file access
  const baseUrl = apiBaseUrl.replace("/api", "");
  return `${baseUrl}/${fileUrl.replace(/^\//, "")}`;
};

const statusDisplayConfig = {
  submitted: {
    label: "Submitted",
    icon: Clock,
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-200",
    message: "Your prescription has been submitted and is waiting for review.",
  },
  in_review: {
    label: "In Review",
    icon: AlertCircle,
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-200",
    message: "Our pharmacists are reviewing your prescription.",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    borderColor: "border-green-200",
    message: "Prescription approved. We will prepare your order shortly.",
  },
  rejected: {
    label: "Rejected",
    icon: AlertCircle,
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    borderColor: "border-red-200",
    message:
      "We could not process this prescription. Please check notes for details.",
  },
  ordered: {
    label: "Order Created",
    icon: Package,
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-800",
    borderColor: "border-indigo-200",
    message:
      "Your medicines have been added to an order and will be processed soon.",
  },
  fulfilled: {
    label: "In Progress",
    icon: Package,
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
    borderColor: "border-purple-200",
    message: "Your order is being packed or has been shipped.",
  },
  delivered: {
    label: "Delivered",
    icon: ShieldCheck,
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-800",
    borderColor: "border-emerald-200",
    message: "Your order has been delivered successfully.",
  },
  cancelled: {
    label: "Cancelled",
    icon: AlertCircle,
    bgColor: "bg-gray-200",
    textColor: "text-gray-700",
    borderColor: "border-gray-300",
    message: "This prescription order has been cancelled.",
  },
};

const normalizeStatus = (status) => {
  if (!status) return "submitted";
  const normalized = status.toLowerCase();
  const aliases = {
    pending: "submitted",
    verified: "approved",
    completed: "delivered",
    reviewing: "in_review",
  };
  return statusDisplayConfig[normalized]
    ? normalized
    : statusDisplayConfig[aliases[normalized]]
    ? aliases[normalized]
    : "submitted";
};

const Prescriptions = () => {
  const [uploadFile, setUploadFile] = useState(null);
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: prescriptionsData, isLoading } = useQuery("prescriptions", () =>
    api.get("/prescriptions").then((res) => res.data)
  );

  // Extract the prescriptions array from the response
  // Backend returns { success: true, data: prescriptions }
  const prescriptions = Array.isArray(prescriptionsData?.data)
    ? prescriptionsData.data
    : Array.isArray(prescriptionsData)
    ? prescriptionsData
    : [];

  const deletePrescriptionMutation = useMutation(
    (prescriptionId) => api.delete(`/prescriptions/${prescriptionId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("prescriptions");
        toast.success("Prescription deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete prescription");
      },
    }
  );

  const uploadPrescriptionMutation = useMutation(
    (formData) =>
      api.post("/prescriptions", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("prescriptions");
        toast.success("Prescription uploaded successfully!");
        // Reset form
        setUploadFile(null);
        setDescription("");
        setNotes("");
        // Scroll to prescriptions list
        setTimeout(() => {
          window.scrollTo({
            top: document.getElementById("prescriptions-list")?.offsetTop - 100,
            behavior: "smooth",
          });
        }, 100);
      },
      onError: (error) => {
        const message =
          error.response?.data?.message || "Failed to upload prescription";
        toast.error(message);
      },
    }
  );

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("prescription", uploadFile);
    formData.append("description", description || "Uploaded prescription");
    if (notes) {
      formData.append("notes", notes);
    }

    try {
      await uploadPrescriptionMutation.mutateAsync(formData);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePrescription = (prescriptionId) => {
    if (window.confirm("Are you sure you want to delete this prescription?")) {
      deletePrescriptionMutation.mutate(prescriptionId);
    }
  };

  const handleDownloadPrescription = async (prescriptionId, originalName) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
      const token = getAccessToken()
      
      if (!token) {
        toast.error('Authentication required to download')
        return
      }

      // Fetch the file as blob
      const response = await fetch(
        `${apiBaseUrl}/prescriptions/${prescriptionId}/download?token=${encodeURIComponent(token)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to download prescription')
      }

      // Get the blob from response
      const blob = await response.blob()
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob)
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = originalName || `prescription-${prescriptionId}.pdf`
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Prescription downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download prescription')
    }
  };

  const getStatusBadge = (status) => {
    const normalized = normalizeStatus(status);
    const config = statusDisplayConfig[normalized];
    const Icon = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bgColor} ${config.textColor} border ${config.borderColor}`}
      >
        <Icon size={14} />
        <span className="text-xs font-semibold uppercase tracking-wide">
          {config.label}
        </span>
      </div>
    );
  };

  const getStatusMessage = (status) => {
    const normalized = normalizeStatus(status);
    return statusDisplayConfig[normalized].message;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 md:px-8 py-8">
      <div>
        <h1 className="section-title">My Prescriptions</h1>
        <p className="text-gray-600">Upload and manage your prescription files</p>
      </div>

      {/* Upload Section */}
      <div className="card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-medical-100 rounded-xl flex items-center justify-center">
            <Upload className="text-primary-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Upload New Prescription
          </h2>
        </div>
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Prescription Image/PDF
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="input-field"
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              Supported formats: JPG, PNG, PDF (Max size: 10MB)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Monthly prescription for diabetes"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or instructions..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !uploadFile}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={18} />
            <span>{uploading ? "Uploading..." : "Upload Prescription"}</span>
          </button>
        </form>
      </div>

      {/* Prescriptions List */}
      <div id="prescriptions-list" className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Prescriptions</h2>
        <p className="text-gray-600 mb-6">View and manage all your uploaded prescriptions</p>

        {!prescriptions || prescriptions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No prescriptions uploaded
            </h3>
            <p className="text-gray-600">
              Upload your prescriptions to get started with easy ordering.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {prescriptions.map((prescription) => {
              const normalizedStatus = normalizeStatus(
                prescription.status || "Pending"
              );
              const statusConfig = statusDisplayConfig[normalizedStatus];
              const StatusIcon = statusConfig.icon;
              const isPDF =
                prescription.fileType === "application/pdf" ||
                prescription.fileType?.includes("pdf");

              return (
                <div
                  key={prescription._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden flex flex-col"
                >
                  {/* Image Preview Section */}
                  <div className="relative h-48 bg-gray-50 border-b border-gray-100 overflow-hidden">
                    {isPDF ? (
                      <div className="flex flex-col items-center justify-center h-full p-4 border-2 border-dashed border-gray-300 rounded-lg m-2">
                        <FileText size={48} className="text-gray-400 mb-2" />
                        <span className="text-xs font-medium text-gray-500">
                          PDF Document
                        </span>
                      </div>
                    ) : (
                      <div className="relative h-full w-full group">
                        <img
                          src={getFileUrl(
                            prescription.fileUrl,
                            prescription._id
                          )}
                          alt={prescription.description || "Prescription"}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            // Replace with placeholder on error
                            e.target.style.display = "none";
                            const placeholder =
                              e.target.parentElement.querySelector(
                                ".image-placeholder"
                              );
                            if (placeholder) placeholder.style.display = "flex";
                          }}
                        />
                        {/* Placeholder - hidden by default, shown on error */}
                          <div className="image-placeholder hidden flex-col items-center justify-center h-full p-4 border-2 border-dashed border-gray-300 rounded-lg m-2 bg-gray-50">
                            <img
                              src={prescriptionPlaceholder}
                              alt="Prescription placeholder"
                              className="w-16 h-16 object-contain mb-2 opacity-50"
                            />
                          <span className="text-xs text-gray-500 text-center mb-2">
                            Image not available
                          </span>
                          <a
                            href={getFileUrl(
                              prescription.fileUrl,
                              prescription._id
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                          >
                            View File
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Status Badge */}
                    <div className="mb-4">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}
                      >
                        <StatusIcon size={14} />
                        <span className="text-xs font-semibold uppercase tracking-wide">
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {prescription.description || "Prescription"}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {statusConfig.message}
                    </p>

                    {/* Upload Date */}
                    <div
                      className="flex items-center gap-1.5 text-xs text-gray-500 mb-4"
                      title={new Date(prescription.createdAt).toLocaleString()}
                    >
                      <Calendar size={12} />
                      <span>
                        {new Date(prescription.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </span>
                    </div>

                    {/* Notes */}
                    {prescription.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs font-medium text-gray-700 mb-1">
                          Notes:
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {prescription.notes}
                        </p>
                      </div>
                    )}

                    {/* Linked Order */}
                    {prescription.order && (
                      <div className="mb-4 p-3 rounded-xl border border-primary-200 bg-gradient-to-br from-primary-50 to-medical-50">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-xs font-bold text-primary-900">
                              Linked Order
                            </p>
                            <p className="text-xs text-primary-600 mt-0.5">
                              #{prescription.order.orderNumber}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              navigate(
                                `/orders?highlight=${prescription.order._id}`
                              )
                            }
                            className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                          >
                            View →
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="badge badge-info">
                            {prescription.order.status}
                          </span>
                          {prescription.order.total && (
                            <span className="badge badge-success">
                              ₹{prescription.order.total.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex gap-2">
                        <a
                          href={getFileUrl(
                            prescription.fileUrl,
                            prescription._id
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                        >
                          <Eye size={16} />
                          <span>View File</span>
                        </a>
                        <button
                          onClick={() => handleDownloadPrescription(prescription._id, prescription.originalName)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                          title="Download prescription"
                        >
                          <Download size={16} />
                          <span className="hidden sm:inline">Download</span>
                        </button>
                        <button
                          onClick={() =>
                            handleDeletePrescription(prescription._id)
                          }
                          className="p-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                          title="Delete prescription"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;
