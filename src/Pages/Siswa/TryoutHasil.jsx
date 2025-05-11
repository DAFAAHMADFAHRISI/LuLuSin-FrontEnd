"use client"

import { motion } from "framer-motion"
import { CheckCircle, XCircle, HelpCircle, BarChart3, BookOpen, Award, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axiosInstance from "../../api/axiosInstance"

export default function SiswaTryoutHasil() {
  const [hoveredCard, setHoveredCard] = useState(null)
  const [tryoutResults, setTryoutResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { id } = useParams()
  const [subjectList, setSubjectList] = useState([])
  const [timeoutError, setTimeoutError] = useState(false)

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axiosInstance.get(`/API/student/tryout/${id}`)
        // Ambil array subjek dari getTryout.subjects dan filter unik berdasarkan subject_id
        let subjects = []
        if (res.data.getTryout && Array.isArray(res.data.getTryout.subjects)) {
          const seen = new Set()
          subjects = res.data.getTryout.subjects.filter(sub => {
            if (seen.has(sub.subject_id)) return false
            seen.add(sub.subject_id)
            return true
          })
        }
        setSubjectList(subjects)
        if (subjects.length === 0) {
          setTimeoutError(true)
        }
      } catch (err) {
        setSubjectList([])
        setTimeoutError(true)
      }
    }
    fetchSubjects()
  }, [id])

  // Timeout loading jika lebih dari 5 detik
  useEffect(() => {
    if (!timeoutError && loading) {
      const timer = setTimeout(() => {
        setTimeoutError(true)
        setLoading(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [loading, timeoutError])

  useEffect(() => {
    const fetchTryoutResults = async () => {
      try {
        const response = await axiosInstance.get(`/API/student/tryout/${id}/result`)
        const raw = response.data
        const summary = Array.isArray(raw.summary) ? raw.summary[0] : raw.summary
        let perCategorySubject = []
        if (Array.isArray(raw.perCategorySubject)) {
          raw.perCategorySubject.forEach(item => {
            const result = typeof item.result === 'string' ? JSON.parse(item.result) : (item.result || {})
            const subjekArr = Array.isArray(result.subjek) ? result.subjek : (result.subjek ? [result.subjek] : [])
            subjekArr.forEach(sub => {
              // Cari id_subject dari subjectList dengan pencocokan case-insensitive dan trim
              const subjectData = subjectList.find(s => {
                if (!s.subject_name || !sub.nama_subjek) return false;
                const a = s.subject_name.trim().toLowerCase();
                const b = sub.nama_subjek.trim().toLowerCase();
                return a === b;
              });
              if (!subjectData) {
                console.warn('ID subject tidak ditemukan untuk:', sub.nama_subjek)
              }
              perCategorySubject.push({
                category_name: result.nama_kategori || '-',
                subject_name: sub.nama_subjek || '-',
                subject_id: subjectData ? subjectData.subject_id : null,
                average_score: sub.nilai_rata_rata || 0,
                total_correct: sub.total_jawaban_benar || 0,
                total_wrong: sub.total_jawaban_salah || 0,
                total_empty: sub.total_jawaban_kosong || 0,
              })
            })
          })
        }
        setTryoutResults({ summary, perCategorySubject })
        setLoading(false)
        setTimeoutError(false)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch tryout results')
        setLoading(false)
        setTimeoutError(true)
      }
    }
    fetchTryoutResults()
  }, [id, subjectList])

  if (timeoutError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>Timeout: Data tidak berhasil dimuat. Silakan refresh halaman atau hubungi admin.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#1E3A5F] text-white px-4 py-2 rounded-lg"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  // Test categories data
  const testCategories = [
    {
      title: "Tes Skolastik",
      icon: <BookOpen className="mr-2" size={20} />,
      subcategories: [
        "Penalaran Umum",
        "Pengetahuan dan Pemahaman Umum",
        "Pemahaman Baca dan Menulis",
        "Pengetahuan Kuantitatif",
      ],
    },
    {
      title: "Tes Literasi",
      icon: <BarChart3 className="mr-2" size={20} />,
      subcategories: ["Literasi Bahasa Indonesia", "Literasi Bahasa Inggris"],
    },
    {
      title: "Tes Penalaran Matematika",
      icon: <Award className="mr-2" size={20} />,
      subcategories: [],
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E3A5F]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/siswa/tryout')}
            className="mt-4 bg-[#1E3A5F] text-white px-4 py-2 rounded-lg"
          >
            Back to Tryout
          </button>
        </div>
      </div>
    )
  }

  // Get metrics from API data
  const metrics = tryoutResults?.summary ? [
    { title: "Nilai", value: tryoutResults.summary.average_score.toString(), icon: <Award size={18} className="text-yellow-300" /> },
    { title: "Total Jawaban Benar", value: tryoutResults.summary.total_correct.toString(), icon: <CheckCircle size={18} className="text-green-400" /> },
    { title: "Total Jawaban Salah", value: tryoutResults.summary.total_wrong.toString(), icon: <XCircle size={18} className="text-red-400" /> },
    { title: "Total Jawaban Kosong", value: tryoutResults.summary.total_empty.toString(), icon: <HelpCircle size={18} className="text-gray-400" /> },
  ] : []

  return (
    <div className="bg-gradient-to-b from-[#F5F0E9] to-[#EAE5DE] flex flex-col items-center p-6 min-h-screen w-screen">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl space-y-6"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center justify-between mb-6"
        >
          <motion.a 
            href="/siswa/tryout" 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <motion.button
              className="bg-gradient-to-r from-[#1E3A5F] to-[#2E4A7F] text-white p-3 rounded-full shadow-md flex items-center justify-center"
              style={{ boxShadow: "0 4px 6px -1px rgba(30, 58, 95, 0.3)" }}
            >
              <ArrowLeft size={20} />
            </motion.button>
          </motion.a>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-2xl font-bold text-[#1E3A5F] flex items-center"
          >
            <span className="bg-[#1E3A5F] h-6 w-1.5 rounded-full mr-2 inline-block"></span>
            Hasil Tryout SNBT
          </motion.h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gradient-to-br from-[#1E3A5F] to-[#2E4A7F] text-white p-6 rounded-xl shadow-lg"
          style={{ boxShadow: "0 10px 25px -5px rgba(30, 58, 95, 0.4)" }}
        >
          {metrics.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                transition: { type: "spring", stiffness: 300 },
              }}
              className="flex flex-col items-center justify-center p-4 rounded-xl"
            >
              {item.icon}
              <p className="text-sm text-blue-200">{item.title}</p>
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5, type: "spring" }}
                className="text-3xl font-bold"
              >
                {item.value}
              </motion.span>
            </motion.div>
          ))}
        </motion.div>

        {tryoutResults?.perCategorySubject?.map((category, categoryIndex) => (
          <motion.div
            key={categoryIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + categoryIndex * 0.1, duration: 0.5 }}
            className="bg-gradient-to-br from-[#1E3A5F] to-[#2E4A7F] text-white p-6 rounded-xl shadow-lg cursor-pointer"
            style={{ boxShadow: "0 10px 25px -5px rgba(30, 58, 95, 0.4)" }}
            onClick={() => {
              if (category.subject_id) {
                navigate(`/siswa/tryout/${id}/${category.subject_id}/pembahasan`, { replace: true })
              } else {
                alert('Pembahasan untuk subject ini belum tersedia (ID tidak ditemukan).')
              }
            }}
            whileHover={{
              scale: 1.02,
              transition: { type: "spring", stiffness: 300 },
            }}
          >
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + categoryIndex * 0.1, duration: 0.5 }}
              className="text-center text-xl font-semibold mb-4 flex items-center justify-center"
            >
              {category.category_name}
              <span className="ml-2 text-sm text-blue-200">({category.subject_name})</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + categoryIndex * 0.1, duration: 0.5 }}
              className="mt-4 bg-[#1A3352]/50 p-4 rounded-xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-2">
                {[
                  { title: "Nilai", value: category.average_score.toString(), icon: <Award size={24} className="text-yellow-300 mb-2" /> },
                  { title: "Total Jawaban Benar", value: category.total_correct.toString(), icon: <CheckCircle size={24} className="text-green-400 mb-2" /> },
                  { title: "Total Jawaban Salah", value: category.total_wrong.toString(), icon: <XCircle size={24} className="text-red-400 mb-2" /> },
                  { title: "Total Jawaban Kosong", value: category.total_empty.toString(), icon: <HelpCircle size={24} className="text-gray-400 mb-2" /> },
                ].map((metric, metricIndex) => (
                  <motion.div
                    key={metricIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + categoryIndex * 0.1 + metricIndex * 0.05, duration: 0.5 }}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      transition: { type: "spring", stiffness: 300 },
                    }}
                    className="bg-gradient-to-br from-[#2C4A6E] to-[#3A5A80] p-4 rounded-xl text-center shadow-md relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-bl-full opacity-5"></div>
                    <div className="flex items-center justify-center mb-2">
                      {metric.icon}
                      <p className="ml-1 text-sm">{metric.title}</p>
                    </div>
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: 0.9 + categoryIndex * 0.1 + metricIndex * 0.05,
                        duration: 0.5,
                        type: "spring",
                      }}
                      className={`text-xl font-bold ${
                        metric.title === "Nilai"
                          ? "text-yellow-300"
                          : metric.title.includes("Benar")
                            ? "text-green-400"
                            : metric.title.includes("Salah")
                              ? "text-red-400"
                              : "text-gray-400"
                      }`}
                    >
                      {metric.value}
                    </motion.span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex justify-center mt-6"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 15px 30px -5px rgba(30, 58, 95, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            onClick={() => navigate('/siswa/tryout')}
            className="bg-gradient-to-r from-[#1E3A5F] to-[#2E4A7F] text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg"
            style={{ boxShadow: "0 10px 15px -3px rgba(30, 58, 95, 0.3)" }}
          >
            Keluar
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}

