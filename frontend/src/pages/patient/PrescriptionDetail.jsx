import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  FileText,
  User,
  Calendar,
  Clock,
  ShoppingCart,
  ChevronLeft,
  Download,
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PrescriptionDetail = () => {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const [prescription, setPrescription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const pdfRef = useRef();
  const { addToCart } = useCart();

  const isTrue = (val) => val === true || val === 1;

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const response = await axios.get(`/api/patients/${user.id}/prescriptions/${id}`);
        setPrescription(response.data);
      } catch (error) {
        console.error('Error fetching prescription:', error);
        toast.error('Failed to load prescription details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescription();
  }, [id, user.id]);

  const generatePdf = async () => {
    const element = pdfRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Prescription-${prescription.id}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-gentle text-primary-500">Loading prescription details...</div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="text-center py-12">
        <div className="bg-neutral-100 p-3 rounded-full inline-flex items-center justify-center mb-3">
          <FileText size={24} className="text-neutral-500" />
        </div>
        <p className="text-neutral-600 mb-3">Prescription not found</p>
        <Link to="/patient/prescriptions" className="btn btn-outline">
          Back to Prescriptions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/patient/prescriptions" className="text-neutral-600 hover:text-neutral-800">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="font-heading text-2xl font-bold text-neutral-800">Prescription Details</h1>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-outline" onClick={generatePdf}>
          <Download size={18} className="mr-2" />
          Download PDF
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-card p-6" ref={pdfRef}>
        {/* Doctor and Date Info */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-6 border-b border-neutral-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Dr. {prescription.doctor_name}</h2>
              <p className="text-neutral-600">{prescription.specialization}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
            <div className="flex items-center gap-2 text-neutral-600">
              <Calendar size={18} />
              <span>{new Date(prescription.appointment_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <Clock size={18} />
              <span>{prescription.appointment_time}</span>
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Diagnosis</h3>
          <p className="text-neutral-600">{prescription.diagnosis}</p>
        </div>

        {/* Medicines */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Prescribed Medicines</h3>
            <Link 
              to="/patient/cart" 
              state={{ prescriptionId: prescription.id }}
              className="btn btn-primary btn-sm"
            >
              <ShoppingCart size={16} />
              <span>Cart</span>
            </Link>
          </div>

          <div className="space-y-4">
            {prescription.medicines.map((medicine, index) => (
              <div key={index} className="bg-neutral-50 rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h4 className="font-medium">{medicine.name}</h4>
                    <p className="text-sm text-neutral-600">{medicine.category}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isTrue(medicine.morning) && <span className="badge badge-primary">Morning</span>}
                    {isTrue(medicine.afternoon) && <span className="badge badge-primary">Afternoon</span>}
                    {isTrue(medicine.evening) && <span className="badge badge-primary">Evening</span>}
                    {isTrue(medicine.night) && <span className="badge badge-primary">Night</span>}
                  </div>
                </div>
                <div className="mt-3 text-sm text-neutral-600">
                  <p>
                    Take {medicine.before_meal ? 'before' : 'after'} meal
                    {medicine.dosage && ` • ${medicine.dosage}`}
                  </p>
                  {medicine.comments && <p className="mt-1">{medicine.comments}</p>}
                </div>

                <div className="mt-4">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      addToCart({
                        id: medicine.id,
                        name: medicine.name,
                        category: medicine.category,
                        price: medicine.price || 10,
                        quantity: 1,
                      });
                      toast.success(`${medicine.name} added to cart!`);
                    }}
                  >
                    <ShoppingCart size={14} className="mr-2" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor's Comments */}
        {prescription.comments && (
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <h3 className="text-lg font-semibold mb-2">Additional Notes</h3>
            <p className="text-neutral-600">{prescription.comments}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionDetail;
