import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useGlobalContext } from "../../context/GlobalContext";
import logo from "../../assets/logo.png"
import {
   Document,
   Image,
   Page,
   Text,
   View,
   StyleSheet,
   PDFDownloadLink,
   Font
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: '#1a1a1a',
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  // --- Red/Black Accents ---
  brandBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#e11d48', // Primary Red
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '1 solid #e5e7eb',
  },
  logo: {
    width: 80,
    height: 'auto',
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addressText: {
    fontSize: 8,
    color: '#666',
    width: 180,
    marginTop: 4,
    lineHeight: 1.4,
  },
  receiptTitleBox: {
    textAlign: 'right',
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e11d48',
  },
  
  // --- Detail Sections ---
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  infoSection: {
    width: '45%',
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#e11d48',
    textTransform: 'uppercase',
    marginBottom: 6,
    borderBottom: '1 solid #f4f4f5',
    paddingBottom: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: { color: '#666', fontSize: 9 },
  value: { fontWeight: 'bold', fontSize: 9 },

  // --- Table Design ---
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 8,
    borderRadius: 2,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottom: '1 solid #f1f5f9',
    alignItems: 'center',
  },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1, textAlign: 'right' },

  // --- Payment Summary ---
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  paymentStatus: {
    marginTop: 10,
    padding: 10,
    border: '2 solid #005205',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#005205',
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  totalBox: {
    width: '40%',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 4,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'right',
    marginTop: 5,
    borderTop: '1 solid #cbd5e1',
    paddingTop: 5,
  },

  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: '1 solid #e5e7eb',
    paddingTop: 20,
  },
  ownerNote: {
    textAlign: 'center',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 7,
    color: '#94a3b8',
    marginTop: 10,
  }
});

const PaymentReceiptPDF = ({ txn }) => (
  <Document title={`SongarsGym_Receipt_${txn.id}`}>
    <Page size="A4" style={styles.page}>
      <View style={styles.brandBar} />

      {/* Header Area */}
      <View style={styles.header}>
        <View>
          <Image src={logo} style={styles.logo} />
          <Text style={styles.companyName}>Songar's Gym</Text>
          <Text style={styles.addressText}>
            B-409,410 Shivalik Yash Complex, Shastrinagar Cross Road, 
            132 Feet Ring Rd, Naranpura, Ahmedabad, Gujarat 380013
          </Text>
        </View>
        <View style={styles.receiptTitleBox}>
          <Text style={styles.receiptTitle}>RECEIPT</Text>
          <Text style={{ fontSize: 10, marginTop: 5 }}>No: #{txn.id.slice(-6).toUpperCase()}</Text>
          <Text style={{ fontSize: 10, color: '#666' }}>Date: {txn.date}</Text>
        </View>
      </View>

      {/* Member & Payment Meta */}
      <View style={styles.infoGrid}>
        <View style={styles.infoSection}>
          <Text style={styles.sectionLabel}>Member Information</Text>
          <View style={styles.detailRow}><Text style={styles.label}>Name:</Text><Text style={styles.value}>{txn.member}</Text></View>
          <View style={styles.detailRow}><Text style={styles.label}>Member ID:</Text><Text style={styles.value}>{txn.memberId || 'N/A'}</Text></View>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.sectionLabel}>Transaction Details</Text>
          <View style={styles.detailRow}><Text style={styles.label}>Payment Method:</Text><Text style={styles.value}>{txn.method}</Text></View>
          <View style={styles.detailRow}><Text style={styles.label}>Invoice Ref:</Text><Text style={styles.value}>{txn.invoiceId || 'N/A'}</Text></View>
        </View>
      </View>

      {/* Billing Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colDesc]}>Membership Plan</Text>
          <Text style={[styles.tableHeaderText, styles.colQty]}>Duration</Text>
          <Text style={[styles.tableHeaderText, styles.colPrice]}>Amount</Text>
        </View>
        
        <View style={styles.tableRow}>
          <View style={styles.colDesc}>
            <Text style={{ fontWeight: 'bold' }}>{txn.plan}</Text>
            <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>Access to all gym facilities & trainers</Text>
          </View>
          <Text style={styles.colQty}>1 Unit</Text>
          <Text style={styles.colPrice}>rs.{txn.amount.toLocaleString()}</Text>
        </View>
      </View>

      {/* Summary Area */}
      <View style={styles.summaryContainer}>
        <View style={styles.paymentStatus}>
          <Text style={styles.statusText}>{txn.status}</Text>
        </View>
        <View style={styles.totalBox}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>rs.{txn.amount.toLocaleString()}</Text>
          </View>
         
          <Text style={styles.totalAmount}>Total: rs.{txn.amount.toLocaleString()}</Text>
        </View>
      </View>

      {/* Footer & Signature */}
      <View style={styles.footer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Text style={{ fontSize: 9, marginBottom: 2 }}>Authorized By:</Text>
            <Text style={styles.ownerNote}>{txn.recordedBy || 'Manthan Prajapati'}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
             <Text style={{ fontSize: 8, fontStyle: 'italic' }}>Owner: Manthan Prajapati</Text>
          </View>
        </View>
        
        <Text style={styles.disclaimer}>
          1. Membership fees are non-refundable. | 2. Please carry your digital ID at all times. | 3. This is a computer-generated receipt.
        </Text>
      </View>
    </Page>
  </Document>
);
const PaymentHistory = () => {
   const { BACKEND_URL } = useGlobalContext();

   // --- STATE ---
   const [payments, setPayments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [filterStatus, setFilterStatus] = useState("All");
   const [filterMethod, setFilterMethod] = useState("All");
   const [filterDate, setFilterDate] = useState("");
   const [selectedTxn, setSelectedTxn] = useState(null);
   const [showModal, setShowModal] = useState(false);

   // --- STYLE INJECTION ---
   useEffect(() => {
      const link = document.createElement("link");
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);
      return () => { document.head.removeChild(link); };
   }, []);

   // --- FETCH DATA ---
   useEffect(() => {
      const fetchHistory = async () => {
         try {
            setLoading(true);
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const token = userInfo?.token;

            const res = await fetch(`${BACKEND_URL}/api/payments/all`, {
               headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to load history");

            const data = await res.json();
            setPayments(data);
         } catch (err) {
            console.error(err);
            toast.error("Failed to load payment history");
         } finally {
            setLoading(false);
         }
      };

      fetchHistory();
   }, [BACKEND_URL]);

   // --- HELPERS ---
   const getStatusStyle = (status) => {
      switch (status) {
         case "Paid": return "bg-[#D9F17F] text-green-900 border-green-200";
         case "Pending": return "bg-[#FEEF75] text-yellow-900 border-yellow-200";
         case "Failed": return "bg-red-50 text-red-600 border-red-200";
         case "Refunded": return "bg-gray-100 text-gray-500 border-gray-200 line-through";
         default: return "bg-gray-50 text-gray-600 border-gray-200";
      }
   };

   const handleExportCSV = () => {
      const headers = ["ID,Member,Plan,Amount,Method,Date,Status,RecordedBy"];
      const rows = filteredPayments.map(p =>
         `${p.id},${p.member},${p.plan},${p.amount},${p.method},${p.date},${p.status},${p.recordedBy}`
      );
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      const link = document.createElement("a");
      link.href = encodeURI(csvContent);
      link.download = `payment_history_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
   };

   const handleViewDetails = (txn) => {
      setSelectedTxn(txn);
      setShowModal(true);
   };

   // --- FILTERING ---
   const filteredPayments = payments.filter(p => {
      const matchesSearch = p.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "All" || p.status === filterStatus;
      const matchesMethod = filterMethod === "All" || p.method === filterMethod;
      const matchesDate = filterDate === "" || p.date === filterDate;

      return matchesSearch && matchesStatus && matchesMethod && matchesDate;
   });

   // --- SUMMARY CALCULATIONS ---
   const totalCollected = filteredPayments
      .filter(p => p.status === "Paid" || p.status === "Pending")
      .reduce((sum, p) => sum + p.amount, 0);

   const totalRefunds = filteredPayments
      .filter(p => p.status === "Refunded")
      .reduce((sum, p) => sum + p.amount, 0);

   const pendingCount = filteredPayments.filter(p => p.status === "Pending").length;

   if (loading) return <div className="p-10 text-center text-gray-500">Loading History...</div>;

   return (
      <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 font-sans min-h-screen relative">
         <ToastContainer />

         {/* HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
               <h1 className="text-2xl font-bold text-gray-900">Financial Records</h1>
               <p className="text-sm text-gray-500 mt-1">Audit logs and transaction history.</p>
            </div>
            <button
               onClick={handleExportCSV}
               className="px-5 py-2.5 rounded-full bg-[#CDE7FE] text-blue-900 text-sm font-semibold hover:bg-blue-200 transition-colors shadow-sm flex items-center gap-2"
            >
               <i className="fa-solid fa-download"></i> Export Data
            </button>
         </div>

         {/* SUMMARY CARDS */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#f0fdf4] border border-green-100 p-5 rounded-3xl">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Net Collection</p>
                     <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalCollected.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                     <i className="fa-solid fa-sack-dollar"></i>
                  </div>
               </div>
            </div>
            
         </div>

         {/* FILTERS TOOLBAR */}
         <div className="flex flex-wrap gap-3 mb-6 bg-gray-50 p-3 rounded-2xl border border-gray-200">
            <div className="relative flex-grow md:flex-grow-0 md:w-64">
               <input
                  type="text"
                  placeholder="Search Transaction ID or Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] text-sm"
               />
               <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            </div>

            <select
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
               className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] cursor-pointer"
            >
               <option value="All">All Status</option>
               <option value="Paid">Paid</option>
               <option value="Pending">Pending</option>
               <option value="Refunded">Refunded</option>
               <option value="Failed">Failed</option>
            </select>

            <select
               value={filterMethod}
               onChange={(e) => setFilterMethod(e.target.value)}
               className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] cursor-pointer"
            >
               <option value="All">All Methods</option>
               <option value="Cash">Cash</option>
               <option value="UPI">UPI</option>
               <option value="Card">Card</option>
            </select>

            <input
               type="date"
               value={filterDate}
               onChange={(e) => setFilterDate(e.target.value)}
               className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDE7FE] cursor-pointer"
            />

            {(searchTerm || filterStatus !== "All" || filterMethod !== "All" || filterDate) && (
               <button
                  onClick={() => { setSearchTerm(""); setFilterStatus("All"); setFilterMethod("All"); setFilterDate(""); }}
                  className="px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors ml-auto"
               >
                  Clear Filters
               </button>
            )}
         </div>

         {/* PAYMENTS TABLE */}
         <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
               <thead className="bg-[#f8f9fa]">
                  <tr>
                     <th className="px-6 py-4 font-semibold text-gray-900">Transaction ID</th>
                     <th className="px-6 py-4 font-semibold text-gray-900">Member</th>
                     <th className="px-6 py-4 font-semibold text-gray-900">Plan</th>
                     <th className="px-6 py-4 font-semibold text-gray-900 text-right">Amount</th>
                     <th className="px-6 py-4 font-semibold text-gray-900 text-center">Date & Mode</th>
                     <th className="px-6 py-4 font-semibold text-gray-900 text-center">Status</th>
                     <th className="px-6 py-4 font-semibold text-gray-900 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredPayments.length > 0 ? filteredPayments.map((p) => (
                     <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-600">{p.id}</td>
                        <td className="px-6 py-4">
                           <div className="font-bold text-gray-900">{p.member}</div>
                           <div className="text-[10px] text-gray-400">{p.memberId ? `#${p.memberId.slice(-4)}` : ""}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-800">{p.plan}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">₹{p.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                           <div className="text-gray-900 text-xs">{p.date}</div>
                           <div className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 inline-block px-1.5 rounded mt-1">{p.method}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(p.status)}`}>
                              {p.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button
                              onClick={() => handleViewDetails(p)}
                              className="text-gray-400 hover:text-blue-600 transition-colors p-2"
                              title="View Details"
                           >
                              <i className="fa-regular fa-eye"></i>
                           </button>
                        </td>
                     </tr>
                  )) : (
                     <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                           <i className="fa-solid fa-file-invoice-dollar text-2xl mb-2 block opacity-20"></i>
                           No payment records found.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* --- DETAILS MODAL --- */}
         {showModal && selectedTxn && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                  {/* Modal Header */}
                  <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                     <h3 className="font-bold text-gray-900">Transaction Details</h3>
                     <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <i className="fa-solid fa-xmark text-lg"></i>
                     </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6">

                     {/* Receipt Header */}
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-xl">
                           <i className="fa-solid fa-receipt"></i>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-bold text-gray-900">₹{selectedTxn.amount.toLocaleString()}</p>
                           <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${getStatusStyle(selectedTxn.status)}`}>
                              {selectedTxn.status}
                           </span>
                        </div>
                     </div>

                     {/* Grid Details */}
                     <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-6">
                        <div>
                           <p className="text-xs text-gray-400 mb-1">Transaction ID</p>
                           <p className="font-mono font-medium text-gray-800">{selectedTxn.id}</p>
                        </div>
                        <div>
                           <p className="text-xs text-gray-400 mb-1">Invoice Ref</p>
                           <p className="font-mono font-medium text-gray-800">{selectedTxn.invoiceId || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-xs text-gray-400 mb-1">Date</p>
                           <p className="font-medium text-gray-800">{selectedTxn.date}</p>
                        </div>
                        <div>
                           <p className="text-xs text-gray-400 mb-1">Payment Method</p>
                           <p className="font-medium text-gray-800 flex items-center gap-2">
                              {selectedTxn.method}
                              {selectedTxn.method === 'UPI' && <i className="fa-solid fa-mobile-screen text-gray-300"></i>}
                              {selectedTxn.method === 'Cash' && <i className="fa-solid fa-money-bill-wave text-gray-300"></i>}
                           </p>
                        </div>
                     </div>

                     {/* Member Details Section */}
                     <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payer Details</p>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-gray-600">Member</span>
                           <span className="font-bold text-gray-900">{selectedTxn.member}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-gray-600">Member ID</span>
                           <span className="font-mono text-gray-900 text-xs">{selectedTxn.memberId ? `#${selectedTxn.memberId.slice(-4)}` : "-"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-gray-600">Plan</span>
                           <span className="font-medium text-blue-600">{selectedTxn.plan}</span>
                        </div>
                     </div>

                     {/* Audit Trail */}
                     <div className="border-t border-gray-100 pt-4 mb-6">
                        <p className="text-xs text-gray-400">
                           <i className="fa-solid fa-user-shield mr-1"></i>
                           Recorded by: <span className="text-gray-700 font-medium">{selectedTxn.recordedBy}</span>
                        </p>
                     </div>

                     {/* Actions */}
                     <div className="flex gap-3">
                        <PDFDownloadLink
                           document={<PaymentReceiptPDF txn={selectedTxn} />}
                           fileName={`Receipt_${selectedTxn.member}_${selectedTxn.id.slice(-6)}.pdf`}
                           className="flex-1"
                        >
                           {({ loading }) => (
                              <button
                                 disabled={loading}
                                 className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm disabled:bg-gray-400 cursor-pointer"
                              >
                                 <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-download'} mr-2`}></i>
                                 {loading ? 'Preparing...' : 'Download Receipt'}
                              </button>
                           )}
                        </PDFDownloadLink>

                        
                     </div>

                  </div>
               </div>
            </div>
         )}

      </div>
   );
};

export default PaymentHistory;