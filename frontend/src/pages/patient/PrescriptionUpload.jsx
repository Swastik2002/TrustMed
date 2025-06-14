import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Upload, Search, ShoppingCart, FileText, ChevronLeft } from 'lucide-react';

const PrescriptionUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [matchedMedicines, setMatchedMedicines] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToCart } = useCart();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Reset results
      setExtractedText('');
      setMatchedMedicines([]);
    }
  };

  const handleExtractText = async () => {
    if (!selectedFile) {
      toast.error('Please select a prescription image first');
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('prescriptionImage', selectedFile);

    try {
      const response = await axios.post('/api/medicines/extract-prescription', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setExtractedText(response.data.extractedText);
      setMatchedMedicines(response.data.matchedMedicines);
    } catch (error) {
      console.error('Error processing prescription:', error);
      toast.error('Failed to process prescription image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToCart = (medicine) => {
    addToCart(medicine);
    toast.success(`${medicine.name} added to cart`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/patient/prescriptions" className="text-neutral-600 hover:text-neutral-800">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="font-heading text-2xl font-bold text-neutral-800">Upload Prescription</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Upload Image</h2>
            <p className="text-neutral-600">
              Upload a clear image of your prescription to extract medicines
            </p>
          </div>

          <div className="space-y-4">
            {/* File Input */}
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="prescription-upload"
              />
              <label
                htmlFor="prescription-upload"
                className="cursor-pointer block"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Prescription preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="space-y-2">
                    <Upload size={48} className="mx-auto text-neutral-400" />
                    <p className="text-neutral-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-neutral-500">
                      Supported formats: JPG, PNG
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* Extract Button */}
            <button
              onClick={handleExtractText}
              disabled={!selectedFile || isProcessing}
              className="btn btn-primary w-full"
            >
              {isProcessing ? (
                'Processing...'
              ) : (
                <>
                  <FileText size={18} />
                  <span>Extract Text</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-lg font-semibold mb-4">Extracted Results</h2>

          {isProcessing ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse-gentle text-primary-500">
                Processing prescription...
              </div>
            </div>
          ) : extractedText ? (
            <div className="space-y-6">
              {/* Extracted Text */}
              <div>
                <h3 className="text-md font-medium mb-2">Extracted Text</h3>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-neutral-600 whitespace-pre-line">
                    {extractedText}
                  </p>
                </div>
              </div>

              {/* Matched Medicines */}
              <div>
                <h3 className="text-md font-medium mb-2">Matched Medicines</h3>
                  {matchedMedicines.length > 0 ? (
                    <div className="space-y-3">
                      {matchedMedicines.map((med) => (
                        <div
                          key={med.id}
                          className="flex items-center justify-between bg-neutral-50 rounded p-2"
                        >
                          <div>
                            <p className="font-medium">{med.name}</p>
                            <p className="text-sm text-neutral-600">
                              {med.category} • ₹{med.price}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddToCart(med)}
                            className="btn btn-primary btn-sm"
                          >
                            <ShoppingCart size={16} />
                            <span>Add</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Search size={48} className="mx-auto text-neutral-400 mb-3" />
                      <p className="text-neutral-600">No medicines matched</p>
                    </div>
                  )}
                </div>
              </div>
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-neutral-400 mb-3" />
              <p className="text-neutral-600">
                Upload a prescription and click "Extract Text" to see results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionUpload;