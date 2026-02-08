import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // Updated Toast
import logo from "../../assets/logo.png"
import {
   Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image
} from '@react-pdf/renderer';
import { useGlobalContext } from '../../context/GlobalContext';
import { useTheme } from "../../context/ThemeContext"; // Import Context

// --- PDF STYLES (Print styles remain mostly static black/white) ---
const pdfStyles = StyleSheet.create({
   page: { padding: 40, fontSize: 11, color: '#222', backgroundColor: '#FFFFFF' },
   header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      borderBottomWidth: 3, borderBottomColor: '#D32F2F', paddingBottom: 20, marginBottom: 25
   },
   logo: { width: 80, height: 60 },
   brandName: { fontSize: 24, fontWeight: 'bold', color: '#000', textTransform: 'uppercase' },
   tagline: { fontSize: 9, color: '#D32F2F', letterSpacing: 1, marginTop: 2 },
   invoiceTitle: { fontSize: 28, fontWeight: 'bold', color: '#111', textAlign: 'right' },
   invoiceNo: { fontSize: 10, color: '#666', textAlign: 'right', marginTop: 4 },
   infoSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
   infoBox: { width: '45%' },
   label: { fontSize: 9, textTransform: 'uppercase', color: '#D32F2F', fontWeight: 'bold', marginBottom: 4 },
   value: { fontSize: 11, fontWeight: 'bold', color: '#000', marginBottom: 2 },
   address: { fontSize: 9, color: '#555', lineHeight: 1.4 },
   tableHeader: { flexDirection: 'row', backgroundColor: '#111', padding: 8, borderRadius: 2 },
   tableHeaderText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
   tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 10, paddingHorizontal: 8 },
   colDesc: { flex: 3 },
   colAmt: { flex: 1, textAlign: 'right' },
   totalSection: { marginTop: 30, alignItems: 'flex-end' },
   grandTotalBox: {
      backgroundColor: '#D32F2F', padding: 12, width: '45%', flexDirection: 'row',
      justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderRadius: 4
   },
   grandTotalLabel: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
   grandTotalAmount: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
   footer: {
      position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center',
      borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10, color: '#999', fontSize: 8, textTransform: 'uppercase'
   }
});

// --- PDF COMPONENT ---
const GymInvoicePDF = ({ inv }) => (
   <Document title={`Invoice_${inv.id}`}>
      <Page size="A4" style={pdfStyles.page}>
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
               <Text style={[pdfStyles.address, { textAlign: 'right', marginTop: 5 }]}>Date: {inv.date}</Text>
            </View>
         </View>
         <View style={pdfStyles.infoSection}>
            <View style={pdfStyles.infoBox}>
               <Text style={pdfStyles.label}>Member Details</Text>
               <Text style={pdfStyles.value}>{inv.member.name}</Text>
               <Text style={pdfStyles.address}>Member ID: {inv._id}</Text>
            </View>
            <View style={[pdfStyles.infoBox, { textAlign: 'right' }]}>
               <Text style={pdfStyles.label}>Payment Method</Text>
               <Text style={pdfStyles.value}>{inv.method}</Text>
               <Text style={pdfStyles.address}>Status: PAID</Text>
            </View>
         </View>
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
         <View style={pdfStyles.totalSection}>
            <View style={pdfStyles.grandTotalBox}>
               <Text style={pdfStyles.grandTotalLabel}>TOTAL PAID</Text>
               <Text style={pdfStyles.grandTotalAmount}>rs.{inv.total.toLocaleString()}</Text>
            </View>
         </View>
         <View style={pdfStyles.footer}>
            <Text>Thank you for being part of Songar's Gym! Stay Fit, Stay Strong.</Text>
            <Text style={{ marginTop: 4 }}>This is a computer-generated receipt and does not require a physical signature.</Text>
         </View>
      </Page>
   </Document>
);

const Invoices = () => {
   const { api, BACKEND_URL, loadingIMG} = useGlobalContext();
   const { colors, theme } = useTheme(); // Consume Theme

   const [invoices, setInvoices] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedInvoice, setSelectedInvoice] = useState(null);
   const [showModal, setShowModal] = useState(false);

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
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchInvoices();
   }, []);

   const handleView = (invoice) => {
      setSelectedInvoice(invoice);
      setShowModal(true);
   };

   const handlePrint = () => {
      window.print();
   };

 if (loading) {
      return (
         <div className="fixed inset-0 flex items-center justify-center h-screen" style={{ color: colors.textMuted }}>
            <img src={loadingIMG} className='h-20 w-25'/>
         </div>
      );
   }

   return (
      <div className="w-full max-w-5xl mx-auto space-y-8 pb-10 font-sans px-4 sm:px-6">

         {/* HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
               <h1 className="text-2xl md:text-3xl font-black" style={{ color: colors.text }}>My Invoices</h1>
               <p className="text-sm md:text-base mt-1" style={{ color: colors.textMuted }}>View and download your payment history.</p>
            </div>
         </div>

         {/* INVOICE LIST */}
         <div className="rounded-3xl border shadow-sm overflow-hidden"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            {invoices.length > 0 ? (
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm" style={{ color: colors.textMuted }}>
                     <thead className="border-b text-xs uppercase tracking-wider"
                            style={{ 
                               backgroundColor: theme === 'dark' ? '#1f2937' : '#f8f9fa',
                               borderColor: colors.border,
                               color: colors.textMuted
                            }}>
                        <tr>
                           <th className="px-6 py-4 font-bold whitespace-nowrap">Invoice #</th>
                           <th className="px-6 py-4 font-bold whitespace-nowrap">Date</th>
                           <th className="px-6 py-4 font-bold whitespace-nowrap">Plan</th>
                           <th className="px-6 py-4 font-bold text-right whitespace-nowrap">Amount</th>
                           <th className="px-6 py-4 font-bold text-center whitespace-nowrap">Status</th>
                           <th className="px-6 py-4 font-bold text-right whitespace-nowrap">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y" style={{ divideColor: colors.border }}>
                        {invoices.map((inv) => (
                           <tr key={inv._id} className="transition-colors hover:opacity-80" 
                               style={{ borderBottom: `1px solid ${colors.border}` }}>
                              <td className="px-6 py-4 font-mono font-medium whitespace-nowrap" style={{ color: colors.text }}>{inv.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{inv.date}</td>
                              <td className="px-6 py-4 whitespace-nowrap" style={{ color: colors.text }}>{inv.plan}</td>
                              <td className="px-6 py-4 text-right font-bold whitespace-nowrap" style={{ color: colors.text }}>₹{inv.total.toLocaleString()}</td>
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                 <span className={`px-2 py-1 rounded text-[10px] font-bold border ${inv.status === 'Paid' ? 'bg-[#D9F17F] text-green-900 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                    {inv.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                 <div className="flex items-center justify-end gap-3">
                                    
                                    <PDFDownloadLink
                                       document={<GymInvoicePDF inv={inv} />}
                                       fileName={`Invoice_${inv.id}.pdf`}
                                       className={`flex items-center gap-1 font-bold text-xs ${inv.status === 'Paid' ? 'text-blue-600 hover:text-blue-800' : 'text-gray-300 cursor-not-allowed pointer-events-none'}`}
                                    >
                                       {({ loading }) => (
                                          <span className="flex items-center gap-1">
                                             <i className={loading ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-download"}></i>
                                             {loading ? '...' : 'PDF'}
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
                  <i className="fa-solid fa-file-invoice-dollar text-4xl mb-3" style={{ color: colors.textMuted }}></i>
                  <p style={{ color: colors.textMuted }}>No invoices found.</p>
               </div>
            )}
         </div>

         {/* --- INVOICE DETAILS MODAL --- */}
         {showModal && selectedInvoice && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:p-0 print:absolute print:inset-0 print:bg-white print:z-[1000]">
               <div className="rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:rounded-none print:w-full print:max-w-none max-h-[90vh] overflow-y-auto"
                    style={{ backgroundColor: colors.card }}>

                  {/* Modal Header */}
                  <div className="px-6 py-4 sm:px-8 sm:py-6 border-b flex justify-between items-center print:hidden sticky top-0 z-10"
                       style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f8f9fa', borderColor: colors.border }}>
                     <h3 className="font-bold text-lg" style={{ color: colors.text }}>Invoice Details</h3>
                     <button onClick={() => setShowModal(false)} className="hover:opacity-70 transition-opacity" style={{ color: colors.textMuted }}>
                        <i className="fa-solid fa-xmark text-xl"></i>
                     </button>
                  </div>

                  {/* Invoice Content */}
                  <div className="p-6 sm:p-8 print:p-10">
                     <div className="flex flex-col sm:flex-row justify-between items-start mb-8 border-b pb-6 gap-4 sm:gap-0" style={{ borderColor: colors.border }}>
                        <div>
                           <h2 className="text-3xl font-black tracking-tight" style={{ color: colors.text }}>INVOICE</h2>
                           <p className="text-sm font-mono mt-1" style={{ color: colors.textMuted }}>#{selectedInvoice.id}</p>
                        </div>
                        <div className="text-left sm:text-right">
                           <h3 className="font-bold text-xl" style={{ color: colors.text }}>Songar's GYM</h3>
                           <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Shastrinagar, Ahmedabad</p>
                           <p className="text-xs" style={{ color: colors.textMuted }}>Gujarat, India</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8 text-sm">
                        <div>
                           <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: colors.textMuted }}>Billed To</p>
                           <p className="font-bold text-lg" style={{ color: colors.text }}>{selectedInvoice.member.name}</p>
                           <p style={{ color: colors.textMuted }}>ID: {selectedInvoice._id?.slice(-6).toUpperCase() || 'N/A'}</p>
                        </div>
                        <div className="text-left sm:text-right">
                           <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: colors.textMuted }}>Payment Info</p>
                           <p className="font-medium" style={{ color: colors.text }}>Date: {selectedInvoice.date}</p>
                           <p className="font-medium" style={{ color: colors.text }}>Method: {selectedInvoice.method}</p>
                        </div>
                     </div>

                     <div className="rounded-2xl p-6 mb-8 border print:border-gray-300"
                          style={{ 
                             backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                             borderColor: colors.border
                          }}>
                        <div className="flex justify-between mb-4 border-b pb-4" style={{ borderColor: colors.border }}>
                           <span className="font-bold" style={{ color: colors.text }}>Description</span>
                           <span className="font-bold" style={{ color: colors.text }}>Amount</span>
                        </div>
                        <div className="flex justify-between mb-2 text-sm">
                           <span style={{ color: colors.textMuted }}>{selectedInvoice.plan}</span>
                           <span className="font-medium" style={{ color: colors.text }}>₹{selectedInvoice.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mb-4 text-sm">
                           <span style={{ color: colors.textMuted }}>Tax (GST 18% Incl.)</span>
                           <span className="font-medium" style={{ color: colors.textMuted }}>₹{selectedInvoice.tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-4 border-t items-end" style={{ borderColor: colors.border }}>
                           <span className="font-black text-lg" style={{ color: colors.text }}>Total</span>
                           <span className="font-black text-[#D9F17F] text-2xl bg-gray-900 px-3 py-1 rounded-lg">₹{selectedInvoice.total.toLocaleString()}</span>
                        </div>
                     </div>

                     {/* Footer Actions */}
                     {selectedInvoice.status === 'Paid' ? (
                        <div className="flex flex-col sm:flex-row gap-3 print:hidden">
                           <button
                              onClick={handlePrint}
                              className="flex-1 py-3 border rounded-xl font-bold transition-colors flex items-center justify-center gap-2 hover:opacity-80"
                              style={{ borderColor: colors.border, color: colors.text }}
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