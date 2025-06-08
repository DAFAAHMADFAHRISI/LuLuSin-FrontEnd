import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const DetailMurid = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch students data
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/API/admin/student");
      // Pastikan student_id ada di data
      const mapped = response.data.map((s) => ({
        student_id: s.student_id || s.id || s.ID,
        student_name: s.student_name || s.nama || s.name,
        NISN: s.NISN || s.nim || s.NIM,
        email: s.email,
        status: s.status,
      }));
      setStudents(mapped);
    } catch (err) {
      console.error("Error fetching students:", err);
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setError("Sesi Anda telah berakhir. Silakan login kembali.");
            navigate('/login');
            break;
          case 403:
            setError("Anda tidak memiliki akses ke halaman ini.");
            navigate('/login');
            break;
          default:
            setError(err.response.data?.message || "Terjadi kesalahan saat memuat data siswa.");
        }
      } else {
        setError("Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete student
  const handleDelete = async (studentId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
      return;
    }

    try {
      setDeleteLoading(true);
      await axiosInstance.delete(`/API/admin/student/delete/${studentId}`);
      // Refresh the students list after successful deletion
      await fetchStudents();
    } catch (err) {
      console.error("Error deleting student:", err);
      alert(err.response?.data?.message || "Gagal menghapus siswa. Silakan coba lagi.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusUpdate = async (studentId, newStatus) => {
    try {
      setLoading(true); // Set loading to true while status is being updated
      await axiosInstance.patch(`/API/admin/student/${studentId}/status`, { status: newStatus });
      await fetchStudents(); // Refresh the students list
    } catch (err) {
      console.error(`Error updating student status to ${newStatus}:`, err);
      alert(err.response?.data?.message || `Gagal memperbarui status siswa menjadi ${newStatus}. Silakan coba lagi.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-gray-100 min-h-screen w-screen fixed inset-0 overflow-hidden">
        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-lg text-gray-600">Memuat data siswa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-gray-100 min-h-screen w-screen fixed inset-0 overflow-hidden">
        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen w-screen fixed inset-0 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white p-6 shadow-md">
        <h1 className="text-xl font-bold text-blue-900">LuLuSin</h1>
        <p className="text-xs text-gray-500">Education Academy</p>
        <nav className="mt-6">
          <ul className="space-y-4">
            <li className="flex items-center space-x-2 text-gray-700 hover:text-blue-900 cursor-pointer">
              <Link to="/admin/dashboard">
                <span className="text-lg">📊</span>
                <span>Dashboard</span>
              </Link>
            </li>

            <li className="flex items-center space-x-2 text-gray-700 hover:text-blue-900 cursor-pointer">
              <Link to="/admin/detailguru">
                <span className="text-lg">👨‍🏫</span>
                <span>Guru</span>
              </Link>
            </li>
            <li className="flex items-center space-x-2 text-gray-700 hover:text-blue-900 cursor-pointer">
              <Link to="/admin/detailmurid">
                <span className="text-lg">👩‍🎓</span>
                <span>Murid</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="p-6 bg-gray-100 flex-1">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Akun Murid</h1>
          </div>
          {/* Tombol Logout di kanan atas */}
          <Link to="/login">
            <button className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
              {/* Logout Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
              </svg>
              Logout
            </button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-100">
                <th className="p-3 text-left text-blue-700 font-semibold">Nama</th>
                <th className="p-3 text-left text-blue-700 font-semibold">NIM</th>
                <th className="p-3 text-left text-blue-700 font-semibold">Email</th>
                <th className="p-3 text-left text-blue-700 font-semibold">Status</th>
                <th className="p-3 text-left text-blue-700 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.student_id} className="border-b hover:bg-blue-50 transition">
                  <td className="p-3 text-blue-900">{student.student_name}</td>
                  <td className="p-3 text-blue-900">{student.NISN}</td>
                  <td className="p-3 text-blue-900">{student.email}</td>
                  <td className="p-3 text-blue-900 capitalize">{student.status}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {student.status === 'process' ? (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(student.student_id, 'accept')}
                            disabled={loading}
                            className={`flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition ${
                              loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {loading ? 'Processing...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(student.student_id, 'reject')}
                            disabled={loading}
                            className={`flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition ${
                              loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {loading ? 'Processing...' : 'Reject'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleDelete(student.student_id)}
                          disabled={deleteLoading}
                          className={`flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition ${
                            deleteLoading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {/* Trash Icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                          {deleteLoading ? 'Menghapus...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetailMurid;