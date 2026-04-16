import React, { useState, useRef, useCallback } from 'react';
import { FileText, Upload, Download, Trash2, CheckCircle, Clock, Eye } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import SignatureCanvas from 'react-signature-canvas';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useDocuments } from '../../context/DocumentsContext';
import { getUserLabel } from '../../utils/userDirectory';
import type { ChamberDocument } from '../../types';
import toast from 'react-hot-toast';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const { documents, addDocument, updateStatus, signDocument, deleteDocument } = useDocuments();

  const [signingDoc, setSigningDoc] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<ChamberDocument | null>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!user) return;
      if (user.role !== 'entrepreneur') {
        toast.error('Only entrepreneurs can upload new documents in this MVP');
        return;
      }
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          let fileType = file.type;
          if (!fileType) {
            if (file.name.toLowerCase().endsWith('.pdf')) fileType = 'application/pdf';
            else if (file.name.toLowerCase().match(/\.(doc|docx)$/)) fileType = 'application/msword';
            else if (file.name.toLowerCase().endsWith('.txt')) fileType = 'text/plain';
            else if (file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) fileType = 'image/jpeg';
            else fileType = 'application/octet-stream';
          }
          addDocument({
            title: file.name.replace(/\.[^/.]+$/, ''),
            fileName: file.name,
            fileData: e.target?.result as string,
            fileType: fileType,
            uploadedBy: user.id,
          });
        };
        reader.readAsDataURL(file);
      });
    },
    [user, addDocument]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  if (!user) return null;

  const handleSign = () => {
    if (!signingDoc) return;
    if (sigCanvas.current?.isEmpty()) {
      toast.error('Please provide a signature');
      return;
    }
    try {
      const canvas = sigCanvas.current?.getCanvas();
      const dataURL = canvas?.toDataURL('image/png');
      if (dataURL) {
        signDocument(signingDoc, dataURL);
      }
      setSigningDoc(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save signature. Please try again.');
    }
  };

  const renderStatusBadge = (status: ChamberDocument['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="gray">Draft</Badge>;
      case 'in_review':
        return <Badge variant="accent">In Review</Badge>;
      case 'signed':
        return <Badge variant="success">Signed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-gray-600">Securely manage, review, and sign agreements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar / Upload */}
        <div className="lg:col-span-1 space-y-6">
          {user.role === 'entrepreneur' ? (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Upload Document</h2>
              </CardHeader>
              <CardBody>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Drag & drop files here, or click to select files
                  </p>
                  <em className="text-xs text-gray-500 mt-1 block">(PDF or Word documents)</em>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody>
                <p className="text-sm text-gray-600">
                  Entrepreneurs upload documents for your review and signature.
                </p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Document list */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
            </CardHeader>
            <CardBody>
              {documents.length === 0 ? (
                <p className="text-sm text-gray-600">No documents available.</p>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-col sm:flex-row sm:items-center p-4 border border-gray-100 bg-gray-50/50 rounded-lg transition-colors"
                    >
                      <div className="p-3 bg-primary-50 rounded-lg mr-4 shrink-0">
                        <FileText size={24} className="text-primary-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {doc.title}
                          </h3>
                          {renderStatusBadge(doc.status)}
                        </div>

                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>File: {doc.fileName}</span>
                          <span>Uploaded by: {getUserLabel(doc.uploadedBy)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0 sm:ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingDoc(doc)}
                          leftIcon={<Eye size={16} />}
                        >
                          View
                        </Button>

                        {/* Entrepreneur actions */}
                        {user.role === 'entrepreneur' && doc.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(doc.id, 'in_review')}
                            leftIcon={<Clock size={16} />}
                          >
                            Submit for Review
                          </Button>
                        )}

                        {/* Universal/Danger actions */}
                        {user.role === 'entrepreneur' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-error-600 hover:text-error-700 hover:bg-error-50"
                            aria-label="Delete"
                            onClick={() => deleteDocument(doc.id)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Signature Modal */}
      {signingDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Sign Document</h2>
              <p className="text-sm text-gray-600">
                Please provide your signature below to approve the agreement.
              </p>
            </div>

            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{ className: 'w-full h-48 cursor-crosshair' }}
                />
              </div>
              <div className="flex justify-end mt-2">
                <button 
                  type="button"
                  onClick={() => sigCanvas.current?.clear()} 
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear signature
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <Button variant="outline" onClick={() => setSigningDoc(null)}>
                Cancel
              </Button>
              <Button onClick={handleSign} leftIcon={<CheckCircle size={18} />}>
                Sign & Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-4xl h-[85vh] flex flex-col rounded-xl bg-white shadow-xl">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{viewingDoc.title}</h2>
                <p className="text-sm text-gray-600">
                  {viewingDoc.fileName} &bull; {viewingDoc.status.replace('_', ' ').toUpperCase()}
                </p>
              </div>
              <Button variant="ghost" onClick={() => setViewingDoc(null)}>Close</Button>
            </div>
            
            <div className="flex-1 p-6 overflow-auto bg-gray-50 flex flex-col items-center justify-start">
              {viewingDoc.fileData ? (
                viewingDoc.fileType?.includes('image') ? (
                  <img src={viewingDoc.fileData} alt="Document preview" className="max-w-full h-auto shadow-sm rounded border bg-white" />
                ) : viewingDoc.fileType?.includes('pdf') || viewingDoc.fileType?.includes('text') ? (
                  <iframe src={viewingDoc.fileData} className="w-full flex-1 rounded border shadow-sm bg-white min-h-[500px]" title="Document Preview" />
                ) : (
                  <div className="text-center mt-20 text-gray-500">
                    <FileText className="mx-auto h-16 w-16 mb-4 text-gray-400" />
                    <p>Preview not natively available for {viewingDoc.fileType || 'this file'}.</p>
                    <a href={viewingDoc.fileData} download={viewingDoc.fileName} className="text-primary-600 font-medium hover:underline mt-4 inline-block">Download to view securely</a>
                  </div>
                )
              ) : (
                <div className="text-center mt-20 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                  <p>No document content available. This might be a legacy stub.</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 px-6 py-4 bg-white rounded-b-xl flex justify-end gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
              <Button variant="outline" onClick={() => setViewingDoc(null)}>Close View</Button>
              {user.role === 'investor' && viewingDoc.status === 'in_review' && (
                <Button 
                  onClick={() => {
                    setSigningDoc(viewingDoc.id);
                    setViewingDoc(null);
                  }} 
                  leftIcon={<CheckCircle size={18} />}
                >
                  Proceed to E-Sign
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};