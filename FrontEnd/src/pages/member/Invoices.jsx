import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import logo from "../../assets/logo.png"
// Importing @react-pdf/renderer from a CDN to ensure it resolves correctly in the browser
import {
   Document,
   Page,
   Text,
   View,
   StyleSheet,
   PDFDownloadLink,
   Image
} from '@react-pdf/renderer';
import { useGlobalContext } from '../../context/GlobalContext';

// --- PDF STYLES ---
const pdfStyles = StyleSheet.create({
   page: { padding: 40, fontSize: 11, color: '#222', backgroundColor: '#FFFFFF' },

   // Header Section
   header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 3,
      borderBottomColor: '#D32F2F', // Brand Red
      paddingBottom: 20,
      marginBottom: 25
   },
   logo: { width: 80, height: 60 }, // Adjust size as needed
   brandName: { fontSize: 24, fontWeight: 'bold', color: '#000', textTransform: 'uppercase' },
   tagline: { fontSize: 9, color: '#D32F2F', letterSpacing: 1, marginTop: 2 },

   invoiceTitle: { fontSize: 28, fontWeight: 'bold', color: '#111', textAlign: 'right' },
   invoiceNo: { fontSize: 10, color: '#666', textAlign: 'right', marginTop: 4 },

   // Info Section
   infoSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
   infoBox: { width: '45%' },
   label: { fontSize: 9, textTransform: 'uppercase', color: '#D32F2F', fontWeight: 'bold', marginBottom: 4 },
   value: { fontSize: 11, fontWeight: 'bold', color: '#000', marginBottom: 2 },
   address: { fontSize: 9, color: '#555', lineHeight: 1.4 },

   // Table Styling
   tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#111', // Black Header
      padding: 8,
      borderRadius: 2
   },
   tableHeaderText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
   tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#EEE',
      paddingVertical: 10,
      paddingHorizontal: 8
   },
   colDesc: { flex: 3 },
   colAmt: { flex: 1, textAlign: 'right' },

   // Totals Section
   totalSection: { marginTop: 30, alignItems: 'flex-end' },
   totalRow: { flexDirection: 'row', width: '40%', justifyContent: 'space-between', marginBottom: 5, paddingRight: 8 },

   grandTotalBox: {
      backgroundColor: '#D32F2F', // Red Box
      padding: 12,
      width: '45%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
      borderRadius: 4
   },
   grandTotalLabel: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
   grandTotalAmount: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

   // Footer
   footer: {
      position: 'absolute',
      bottom: 30,
      left: 40,
      right: 40,
      textAlign: 'center',
      borderTopWidth: 1,
      borderTopColor: '#EEE',
      paddingTop: 10,
      color: '#999',
      fontSize: 8,
      textTransform: 'uppercase'
   }
});
// --- PDF COMPONENT ---
const GymInvoicePDF = ({ inv }) => (
   <Document title={`Invoice_${inv.id}`}>
      <Page size="A4" style={pdfStyles.page}>

         {/* HEADER: Logo & Title */}
         <View style={pdfStyles.header}>
            <View>
               <Image src={logo} style={pdfStyles.logo} />
               <Text style={pdfStyles.brandName}>Songar's GYM</Text>
               <Text style={pdfStyles.tagline}>STRENGTH • DISCIPLINE • RESULTS</Text>
               <Text style={pdfStyles.address}>Shastrinagar, Ahmedabad, Gujarat</Text>
            </View>
            <View>
               <Text style={pdfStyles.invoiceTitle}>INVOICE</Text>
               <Text style={pdfStyles.invoiceNo}>NO: #{inv.id}</Text>
               <Text style={[pdfStyles.address, { textAlign: 'right', marginTop: 5 }]}>
                  Date: {inv.date}
               </Text>
            </View>
         </View>

         {/* CUSTOMER & PAYMENT INFO */}
         <View style={pdfStyles.infoSection}>
            <View style={pdfStyles.infoBox}>
               <Text style={pdfStyles.label}>Member Details</Text>
               <Text style={pdfStyles.value}>{inv.member.name}</Text>
               <Text style={pdfStyles.address}>Member ID: {inv._id?.slice(-6).toUpperCase()}</Text>
            </View>
            <View style={[pdfStyles.infoBox, { textAlign: 'right' }]}>
               <Text style={pdfStyles.label}>Payment Method</Text>
               <Text style={pdfStyles.value}>{inv.method}</Text>
               <Text style={pdfStyles.address}>Status: PAID</Text>
            </View>
         </View>

         {/* ITEM TABLE */}
         <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.colDesc, pdfStyles.tableHeaderText]}>Description</Text>
            <Text style={[pdfStyles.colAmt, pdfStyles.tableHeaderText]}>Amount</Text>
         </View>

         <View style={pdfStyles.tableRow}>
            <View style={pdfStyles.colDesc}>
               <Text style={{ fontWeight: 'bold' }}>{inv.plan} Membership</Text>
               <Text style={{ fontSize: 9, color: '#666', marginTop: 2 }}>Full access to gym facilities & trainer guidance.</Text>
            </View>
            <Text style={pdfStyles.colAmt}>rs.{inv.total.toLocaleString()}</Text>
         </View>

         {/* SUMMARY */}
         <View style={pdfStyles.totalSection}>


            <View style={pdfStyles.grandTotalBox}>
               <Text style={pdfStyles.grandTotalLabel}>TOTAL PAID</Text>
               <Text style={pdfStyles.grandTotalAmount}>rs.{inv.total.toLocaleString()}</Text>
            </View>
         </View>

         {/* FOOTER */}
         <View style={pdfStyles.footer}>
            <Text>Thank you for being part of Songar's Gym! Stay Fit, Stay Strong.</Text>
            <Text style={{ marginTop: 4 }}>This is a computer-generated receipt and does not require a physical signature.</Text>
         </View>
      </Page>
   </Document>
);

const Invoices = () => {
   const { BACKEND_URL } = useGlobalContext();

   // --- STATE ---
   const [invoices, setInvoices] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedInvoice, setSelectedInvoice] = useState(null);
   const [showModal, setShowModal] = useState(false);

   // --- STYLE INJECTION ---
   useEffect(() => {
      const linkToast = document.createElement("link");
      linkToast.href = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css";
      linkToast.rel = "stylesheet";
      document.head.appendChild(linkToast);

      const linkFA = document.createElement("link");
      linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      linkFA.rel = "stylesheet";
      document.head.appendChild(linkFA);

      return () => {
         document.head.removeChild(linkToast);
         document.head.removeChild(linkFA);
      };
   }, []);

   // --- FETCH DATA ---
   const fetchInvoices = async () => {
      try {
         setLoading(true);
         const userInfoRaw = localStorage.getItem("userInfo");
         const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;
         const token = userInfo?.token;

         const res = await fetch(`${BACKEND_URL}/api/payments/my`, {
            headers: { Authorization: `Bearer ${token}` }
         });

         if (!res.ok) throw new Error("Failed to load invoices");
         const data = await res.json();

         const formattedInvoices = data.map(payment => {
            const amount = payment.amount || 0;
            const baseAmount = Math.round(amount / 1.18);
            const tax = amount - baseAmount;

            return {
               id: payment.transactionId || `INV-${(payment._id || "").slice(-6).toUpperCase()}`,
               _id: payment._id,
               date: payment.createdAt ? new Date(payment.createdAt).toISOString().split('T')[0] : "N/A",
               plan: payment.plan?.name || "Member Subscription",
               amount: baseAmount,
               tax: tax,
               total: amount,
               method: payment.method || "Other",
               status: payment.status === 'Success' || payment.status === 'Paid' ? 'Paid' : 'Pending',
               member: { name: userInfo?.name || "Member" }
            };
         });
         setInvoices(formattedInvoices);
      } catch (err) {
         console.error(err);
         toast.error("Failed to load invoices");
         // Mock data for preview if backend fails
         setInvoices([
            { id: "INV-B82A1C", _id: "651f...", date: "2023-10-15", plan: "Monthly Premium", amount: 42, tax: 8, total: 50, method: "UPI", status: "Paid", member: { name: "John Doe" } },
            { id: "INV-C112F4", _id: "6520...", date: "2023-10-20", plan: "Quarterly Basic", amount: 102, tax: 18, total: 120, method: "Card", status: "Pending", member: { name: "John Doe" } }
         ]);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchInvoices();
   }, []);

   // --- ACTIONS ---
   const handleView = (invoice) => {
      setSelectedInvoice(invoice);
      setShowModal(true);
   };

   const handlePrint = () => {
      window.print();
   };

   if (loading) return <div className="p-10 text-center text-gray-500 font-sans">Loading Invoices...</div>;

   return (
      <div className="w-full max-w-5xl mx-auto space-y-8 pb-10 font-sans">
         <ToastContainer position="top-right" autoClose={3000} />

         {/* HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
               <h1 className="text-3xl font-black text-gray-900">My Invoices</h1>
               <p className="text-gray-500 mt-1">View and download your payment history.</p>
            </div>
         </div>

         {/* INVOICE LIST */}
         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {invoices.length > 0 ? (
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-500">
                     <thead className="bg-[#f8f9fa] border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                        <tr>
                           <th className="px-6 py-4 font-bold">Invoice #</th>
                           <th className="px-6 py-4 font-bold">Date</th>
                           <th className="px-6 py-4 font-bold">Plan</th>
                           <th className="px-6 py-4 font-bold text-right">Amount</th>
                           <th className="px-6 py-4 font-bold text-center">Status</th>
                           <th className="px-6 py-4 font-bold text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {invoices.map((inv) => (
                           <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-mono font-medium text-gray-900">{inv.id}</td>
                              <td className="px-6 py-4">{inv.date}</td>
                              <td className="px-6 py-4 text-gray-800">{inv.plan}</td>
                              <td className="px-6 py-4 text-right font-bold text-gray-900">₹{inv.total.toLocaleString()}</td>
                              <td className="px-6 py-4 text-center">
                                 <span className={`px-2 py-1 rounded text-[10px] font-bold border ${inv.status === 'Paid' ? 'bg-[#D9F17F] text-green-900 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                                    }`}>
                                    {inv.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-3">


                                    <PDFDownloadLink
                                       document={<GymInvoicePDF inv={inv} />}
                                       fileName={`Invoice_${inv.id}.pdf`}
                                       className={`flex items-center gap-1 font-bold text-xs ${inv.status === 'Paid' ? 'text-blue-600 hover:text-blue-800' : 'text-gray-300 cursor-not-allowed pointer-events-none'}`}
                                    >
                                       {({ loading }) => (
                                          <span className="flex items-center gap-1">
                                             <i className={loading ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-download"}></i>
                                             {loading ? '...' : 'Download'}
                                          </span>
                                       )}
                                    </PDFDownloadLink>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            ) : (
               <div className="text-center py-16">
                  <i className="fa-solid fa-file-invoice-dollar text-4xl text-gray-200 mb-3"></i>
                  <p className="text-gray-400">No invoices found.</p>
               </div>
            )}
         </div>

         {/* --- INVOICE DETAILS MODAL --- */}
         {showModal && selectedInvoice && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:p-0 print:absolute print:inset-0 print:bg-white print:z-[1000]">
               <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:rounded-none print:w-full print:max-w-none">

                  {/* Modal Header */}
                  <div className="bg-[#f8f9fa] px-8 py-6 border-b border-gray-100 flex justify-between items-center print:hidden">
                     <h3 className="font-bold text-gray-900 text-lg">Invoice Details</h3>
                     <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <i className="fa-solid fa-xmark text-xl"></i>
                     </button>
                  </div>

                  {/* Invoice Content */}
                  <div className="p-8 print:p-10">
                     <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                        <div>
                           <h2 className="text-3xl font-black text-gray-900 tracking-tight">INVOICE</h2>
                           <p className="text-sm text-gray-400 font-mono mt-1">#{selectedInvoice.id}</p>
                        </div>
                        <div className="text-right">
                           <h3 className="font-bold text-xl text-gray-800">Songar's GYM</h3>
                           <p className="text-xs text-gray-400 mt-1">Shastrinagar, Ahmedabad</p>
                           <p className="text-xs text-gray-400">Gujarat, India</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                        <div>
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Billed To</p>
                           <p className="font-bold text-gray-900 text-lg">{selectedInvoice.member.name}</p>
                           <p className="text-gray-500">ID: {selectedInvoice._id?.slice(-6).toUpperCase() || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Info</p>
                           <p className="font-medium text-gray-800">Date: {selectedInvoice.date}</p>
                           <p className="font-medium text-gray-800">Method: {selectedInvoice.method}</p>
                        </div>
                     </div>

                     <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 print:border-gray-300">
                        <div className="flex justify-between mb-4 border-b border-gray-200 pb-4">
                           <span className="font-bold text-gray-700">Description</span>
                           <span className="font-bold text-gray-700">Amount</span>
                        </div>
                        <div className="flex justify-between mb-2 text-sm">
                           <span className="text-gray-600">{selectedInvoice.plan}</span>
                           <span className="font-medium text-gray-900">₹{selectedInvoice.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mb-4 text-sm">
                           <span className="text-gray-500">Tax (GST 18% Incl.)</span>
                           <span className="font-medium text-gray-500">₹{selectedInvoice.tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-4 border-t border-gray-200 items-end">
                           <span className="font-black text-gray-900 text-lg">Total</span>
                           <span className="font-black text-[#D9F17F] text-2xl bg-gray-900 px-3 py-1 rounded-lg">₹{selectedInvoice.total.toLocaleString()}</span>
                        </div>
                     </div>

                     {/* Footer Actions */}
                     {selectedInvoice.status === 'Paid' ? (
                        <div className="flex gap-3 print:hidden">
                           <button
                              onClick={handlePrint}
                              className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                           >
                              <i className="fa-solid fa-print"></i> Print
                           </button>

                           <PDFDownloadLink
                              document={<GymInvoicePDF inv={selectedInvoice} />}
                              fileName={`Invoice_${selectedInvoice.id}.pdf`}
                              className="flex-1"
                           >
                              {({ loading }) => (
                                 <button
                                    disabled={loading}
                                    className="w-full py-3 bg-[#D9F17F] text-green-900 rounded-xl font-bold hover:bg-green-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                 >
                                    <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
                                    {loading ? 'Preparing...' : 'Download PDF'}
                                 </button>
                              )}
                           </PDFDownloadLink>
                        </div>
                     ) : (
                        <div className="mt-4 text-center bg-red-50 border border-red-100 rounded-xl p-4 print:hidden">
                           <p className="text-sm text-red-600 font-bold mb-2">
                              <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                              This invoice is pending payment.
                           </p>
                           <p className="text-xs text-red-500">Download and Print options are disabled until payment is cleared.</p>
                        </div>
                     )}

                  </div>
               </div>
            </div>
         )}

      </div>
   );
};

export default Invoices;