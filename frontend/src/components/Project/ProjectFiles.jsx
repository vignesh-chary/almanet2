import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios';
import { Upload, Trash2, Download, File } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectFiles = ({ projectId }) => {
    const queryClient = useQueryClient();
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    // Fetch project details
    const { data: project, isLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/projects/${projectId}`);
            return res.data;
        }
    });

    // Upload files mutation
    const uploadFilesMutation = useMutation({
        mutationFn: async (files) => {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });
            const res = await axiosInstance.post(`/projects/${projectId}/files`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['project', projectId]);
            toast.success('Files uploaded successfully');
            setFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to upload files');
        }
    });

    // Delete file mutation
    const deleteFileMutation = useMutation({
        mutationFn: async (fileId) => {
            await axiosInstance.delete(`/projects/${projectId}/files/${fileId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['project', projectId]);
            toast.success('File deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete file');
        }
    });

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
    };

    const handleUpload = () => {
        if (files.length === 0) return;
        uploadFilesMutation.mutate(files);
    };

    const handleDownload = (file) => {
        window.open(file.url, '_blank');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Project Files</h2>
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                    >
                        <Upload className="w-5 h-5" />
                        Upload Files
                    </button>
                </div>
            </div>

            {/* Selected Files Preview */}
            {files.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">Selected Files:</h3>
                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm">{file.name}</span>
                                <button
                                    onClick={() => {
                                        setFiles(files.filter((_, i) => i !== index));
                                    }}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleUpload}
                        disabled={uploadFilesMutation.isPending}
                        className="mt-4 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                        {uploadFilesMutation.isPending ? 'Uploading...' : 'Upload Files'}
                    </button>
                </div>
            )}

            {/* Project Files List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project?.files?.map(file => (
                    <div
                        key={file._id}
                        className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <File className="w-8 h-8 text-gray-400" />
                            <div>
                                <h3 className="font-medium">{file.name}</h3>
                                <p className="text-sm text-gray-500">
                                    Uploaded by {file.uploadedBy.name}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleDownload(file)}
                                className="text-primary hover:text-primary/80"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => deleteFileMutation.mutate(file._id)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectFiles; 