"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FiEdit, FiPlus, FiTrash2, FiX } from "react-icons/fi"
import axiosInstance from "../../api/axiosInstance"

const GuruTryout = () => {
  const navigate = useNavigate()
  const [tryouts, setTryouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [tryoutToDelete, setTryoutToDelete] = useState(null)

  useEffect(() => {
    fetchTryouts()
  }, [])

  const fetchTryouts = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching tryouts...')
      const response = await axiosInstance.get("/API/teacher/tryout")
      console.log('Tryout response:', response.data)
      
      if (response.data && (response.data.dataTryout || response.data.datatryout)) {
        const tryoutData = response.data.dataTryout || response.data.datatryout;
        const mappedTryouts = tryoutData.map(tryout => ({
          id: tryout.tryout_id,
          tryout_name: tryout.tryout_name,
          status: tryout.status || 'Hide',
          targetSoal: tryout.total_questions || 0,
          soalDibuat: tryout.total_questions || 0
        }))
        console.log('Mapped tryouts:', mappedTryouts)
        if (mappedTryouts.length === 0) {
          setError("Belum ada data tryout tersedia")
        } else {
          setTryouts(mappedTryouts)
          setError(null)
        }
      } else {
        console.log('No tryout data found in response')
        setTryouts([])
        setError("Belum ada data tryout tersedia")
      }
    } catch (err) {
      console.error('Error fetching tryouts:', err)
      if (err.response) {
        console.error('Error response:', err.response.data)
        setError(err.response.data.message || "Gagal memuat data tryout")
      } else if (err.request) {
        console.error('Error request:', err.request)
        setError("Tidak dapat terhubung ke server. Mohon periksa koneksi anda.")
      } else {
        console.error('Error:', err.message)
        setError("Terjadi kesalahan saat memuat data: " + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const navigateToCreateTryout = () => {
    navigate("/guru/createtryout")
  }

  const navigateToEditTryout = (tryout) => {
    navigate(`/guru/edittryout?id=${tryout.id}`)
  }

  const handleDeleteClick = (tryout) => {
    setTryoutToDelete(tryout)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!tryoutToDelete) return

    try {
      const response = await axiosInstance.delete(`/API/teacher/tryout/delete/${tryoutToDelete.id}`)
      
      if (response.data.success) {
        setTryouts(tryouts.filter(t => t.id !== tryoutToDelete.id))
        setNotification({
          type: 'success',
          message: 'Tryout berhasil dihapus!'
        })
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menghapus tryout'
      })
    } finally {
      setShowDeleteModal(false)
      setTryoutToDelete(null)
    }
  }

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e6] flex items-center justify-center">
        <div className="text-[#2f4a64]">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f0e6] flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f0e6] p-6">
      <div className="max-w-7xl mx-auto">
        {notification && (
          <div className={`mb-4 p-4 rounded-lg ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#2f4a64]">Tryout UTBK SNBT 2025</h1>

          <button
            className="bg-[#2f4a64] text-white px-4 py-2 rounded-lg hover:bg-[#1e364d] transition-all flex items-center gap-2"
            onClick={navigateToCreateTryout}
          >
            <FiPlus size={16} /> Tambah Tryout Baru
          </button>
        </div>

        <div className="overflow-hidden rounded-lg shadow">
          <table className="w-full">
            <thead>
              <tr className="bg-[#2f4a64] text-white">
                <th className="py-3 px-4 text-left w-16">No</th>
                <th className="py-3 px-4 text-left">Nama Tryout</th>
                <th className="py-3 px-4 text-left">Soal Dibuat</th>
                <th className="py-3 px-4 text-left">Target soal</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tryouts.map((tryout, index) => (
                <tr
                  key={tryout.id}
                  className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/guru/tryout/id`)}
                >
                  <td className="py-4 px-4 text-[#2f4a64] font-medium">{index + 1}</td>
                  <td className="py-4 px-4 text-[#2f4a64] font-medium">{tryout.tryout_name}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#2f4a64] rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min((tryout.soalDibuat / tryout.targetSoal) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-[#2f4a64] font-medium">
                        {tryout.soalDibuat}/{tryout.targetSoal}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[#2f4a64] font-medium">{tryout.targetSoal}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      tryout.status.toLowerCase() === "show"
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {tryout.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button
                        className="text-[#2f4a64] hover:text-[#1e364d] transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToEditTryout(tryout);
                        }}
                      >
                        <FiEdit size={18} />
                      </button>
                      <button 
                        className="text-[#2f4a64] hover:text-red-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(tryout);
                        }}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#2f4a64]">Konfirmasi Hapus</h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowDeleteModal(false)}
                >
                  <FiX size={24} />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus tryout "{tryoutToDelete?.tryout_name}"? 
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Batal
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  onClick={handleDeleteConfirm}
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GuruTryout

