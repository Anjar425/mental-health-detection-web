// "use client"

// import React, { useEffect, useState } from "react"
// import { AdminNav } from "../../../components/admin/AdminNav"
// import { getConsensus } from "../../../services/admin"
// import type { Consensus } from "../../../services/admin"

// export default function ConsensusPage() {
//   const [consensus, setConsensus] = useState<Consensus[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     let mounted = true
//     setLoading(true)

//     getConsensus()
//       .then((data) => {
//         if (!mounted) return
//         setConsensus(data || [])
//       })
//       .catch((err) => {
//         console.error("Failed to load consensus:", err)
//         setError("Failed to load consensus from server.")
//       })
//       .finally(() => {
//         if (mounted) setLoading(false)
//       })

//     return () => {
//       mounted = false
//     }
//   }, [])

//   return (
//     <div>
//       <AdminNav />

//       <h2 className="text-lg font-semibold mb-4">
//         Aggregated DASS-21 Consensus (per item)
//       </h2>

//       <div className="border rounded bg-white overflow-auto shadow-sm">
//         {loading ? (
//           <div className="p-6 text-center text-gray-500">
//             Loading consensus...
//           </div>
//         ) : error ? (
//           <div className="p-6 text-center text-red-600">
//             {error}
//           </div>
//         ) : consensus.length === 0 ? (
//           <div className="p-6 text-center text-gray-500">
//             No consensus data available.
//           </div>
//         ) : (
//           <table className="w-full text-left">
//             <thead className="bg-gray-50 text-sm border-b">
//               <tr>
//                 <th className="p-3">Item</th>
//                 <th className="p-3">Depression (agg)</th>
//                 <th className="p-3">Anxiety (agg)</th>
//                 <th className="p-3">Stress (agg)</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {consensus.map((c) => (
//                 <tr key={c.dass21_id} className="hover:bg-gray-50">
//                   <td className="p-3 font-mono">{c.dass21_id}</td>
//                   <td className="p-3">
//                     {Number(c.depression).toFixed(4)}
//                   </td>
//                   <td className="p-3">
//                     {Number(c.anxiety).toFixed(4)}
//                   </td>
//                   <td className="p-3">
//                     {Number(c.stress).toFixed(4)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   )
// }
