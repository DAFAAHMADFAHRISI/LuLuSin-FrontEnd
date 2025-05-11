"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, User, BookOpen, CheckCircle, XCircle, AlertCircle, ArrowLeftCircle } from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"
import axiosInstance from "../../api/axiosInstance"

export default function SiswaTryoutPembahasan() {
  const { idTryout, idSubject } = useParams()
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [hoveredAnswer, setHoveredAnswer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [examData, setExamData] = useState({
    studentData: {},
    subjectExpData: {},
    detail: []
  })

  // Total number of questions
  const totalQuestions = examData.detail?.length || 0

  useEffect(() => {
    const fetchTryoutData = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get(`/API/student/tryout/${idTryout}/${idSubject}/explanation`)
        console.log('Response API:', response.data)

        if (!response.data) {
          throw new Error('Data tidak ditemukan')
        }

        setExamData({
          studentData: {
            student_name: response.data.studentData?.nama || '',
            student_id: response.data.studentData?.nisn || ''
          },
          subjectExpData: {
            subject_name: response.data.subjectExpData?.subjek || '',
            subject_category_name: response.data.subjectExpData?.kategori_subjek || ''
          },
          detail: Array.isArray(response.data.detail) ? response.data.detail.map(item => ({
            question_id: item.id_question,
            question_image: item.image_question,
            question_text: item.question,
            answer_options: item.answer_options.map((option, index) => ({
              option_text: option,
              is_correct: option === item.correct_answer,
              is_selected: option === item.jawaban_siswa
            }))
          })) : []
        })

        setLoading(false)
      } catch (err) {
        console.error('Error:', err)
        const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan saat memuat data'
        setError(errorMessage)
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login')
        }
        
        setLoading(false)
      }
    }

    fetchTryoutData()
  }, [idTryout, idSubject, navigate])

  // Function to handle question navigation
  const navigateQuestion = (direction) => {
    if (direction === "next" && currentQuestion < totalQuestions) {
      setCurrentQuestion((prev) => prev + 1)
    } else if (direction === "prev" && currentQuestion > 1) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  // Function to directly go to a question
  const goToQuestion = (questionNumber) => {
    setCurrentQuestion(questionNumber)
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

  // Get answer status for each question
  const getAnswerStatus = (question) => {
    if (!question) return "unanswered"
    return question.is_correct ? "correct" : "incorrect"
  }

  // Get current question data
  const currentQuestionData = examData.detail[currentQuestion - 1] || null

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
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-[#F5F0E9] to-[#EAE5DE] flex flex-col items-center p-6 min-h-screen w-screen">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center mb-6"
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
              <ArrowLeftCircle size={20} />
            </motion.button>
          </motion.a>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="ml-4 text-xl font-bold text-[#1E3A5F] flex items-center"
          >
            <span className="bg-[#1E3A5F] h-6 w-1.5 rounded-full mr-2 inline-block"></span>
            Pembahasan Tryout
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col md:flex-row gap-6"
        >
          {/* Sidebar */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-gradient-to-br from-[#1E3A5F] to-[#2E4A7F] text-white p-6 rounded-xl shadow-lg w-full md:w-1/3"
            style={{ boxShadow: "0 10px 25px -5px rgba(30, 58, 95, 0.4)" }}
          >
            <motion.div
              variants={itemVariants}
              className="text-center font-semibold text-lg mb-4 flex flex-col items-center"
            >
              <div className="bg-blue-400/20 p-3 rounded-full mb-2">
                <User size={24} className="text-blue-200" />
              </div>
              {examData.studentData?.student_name || "Nama Siswa"}
              <p className="text-sm text-blue-200 mt-1">{examData.studentData?.student_id || "ID Siswa"}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-[#2C4A6E] p-4 rounded-xl text-center mb-6 shadow-md">
              <div className="flex items-center justify-center mb-1">
                <BookOpen size={18} className="text-blue-200 mr-2" />
                <p className="font-semibold">{examData.subjectExpData?.subject_name || "Nama Subjek"}</p>
              </div>
              <p className="text-sm text-blue-200">{examData.subjectExpData?.subject_category_name || "Kategori Subjek"}</p>
            </motion.div>

            <motion.p variants={itemVariants} className="text-sm text-blue-200 mb-2 font-medium">
              Navigasi Soal:
            </motion.p>

            <motion.div variants={containerVariants} className="grid grid-cols-5 sm:grid-cols-7 gap-2">
              {Array.from({ length: totalQuestions }, (_, i) => (
                <motion.button
                  key={i}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.1,
                    transition: { type: "spring", stiffness: 300 },
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToQuestion(i + 1)}
                  className={`p-2 rounded-lg flex items-center justify-center relative ${
                    currentQuestion === i + 1 ? "ring-2 ring-white" : ""
                  } ${
                    getAnswerStatus(examData.detail[i]) === "correct"
                      ? "bg-gradient-to-br from-green-400 to-green-500 text-black font-medium"
                      : getAnswerStatus(examData.detail[i]) === "incorrect"
                        ? "bg-gradient-to-br from-red-400 to-red-500 text-black font-medium"
                        : "bg-gradient-to-br from-[#2C4A6E] to-[#3A5A80]"
                  }`}
                >
                  {i + 1}
                  {getAnswerStatus(examData.detail[i]) === "correct" && (
                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                      <CheckCircle size={8} className="text-green-500" />
                    </div>
                  )}
                  {getAnswerStatus(examData.detail[i]) === "incorrect" && (
                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                      <XCircle size={8} className="text-red-500" />
                    </div>
                  )}
                </motion.button>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6 bg-[#2C4A6E]/50 p-3 rounded-xl">
              <div className="flex justify-between text-sm text-blue-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-400 mr-1"></div>
                  <span>Benar: {examData.detail.filter(q => q.is_correct).length}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
                  <span>Salah: {examData.detail.filter(q => !q.is_correct).length}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#3A5A80] mr-1"></div>
                  <span>Belum: {totalQuestions - examData.detail.filter(q => q.is_correct).length - examData.detail.filter(q => !q.is_correct).length}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-gradient-to-br from-[#1E3A5F] to-[#2E4A7F] text-white p-6 rounded-xl shadow-lg w-full md:w-2/3 flex flex-col items-center"
            style={{ boxShadow: "0 10px 25px -5px rgba(30, 58, 95, 0.4)" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="w-full bg-gray-200 rounded-xl mb-6 overflow-hidden shadow-md"
            >
              <div className="bg-[#2C4A6E] p-2 text-sm font-medium flex justify-between items-center">
                <span>
                  Soal {currentQuestion} dari {totalQuestions}
                </span>
                <span className="bg-blue-200 text-[#1E3A5F] px-2 py-0.5 rounded-full text-xs font-bold">
                  {examData.subjectExpData?.subject_name || "Subjek"}
                </span>
              </div>
              <div className="h-40 bg-gray-300 flex items-center justify-center">
                {currentQuestionData?.question_image ? (
                  <img 
                    src={currentQuestionData.question_image} 
                    alt="Gambar Soal" 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <p className="text-gray-600">Gambar soal tidak tersedia</p>
                )}
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-center text-sm mb-6 bg-[#2C4A6E]/50 p-4 rounded-xl w-full"
            >
              {currentQuestionData?.question_text || "Teks soal tidak tersedia"}
            </motion.p>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{ delayChildren: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
            >
              {currentQuestionData?.answer_options?.map((option, index) => (
                <motion.button
                  key={index}
                  variants={itemVariants}
                  custom={index}
                  whileHover={{
                    scale: 1.03,
                    transition: { type: "spring", stiffness: 300 },
                  }}
                  whileTap={{ scale: 0.97 }}
                  onHoverStart={() => setHoveredAnswer(index)}
                  onHoverEnd={() => setHoveredAnswer(null)}
                  className={`p-4 rounded-xl text-left flex items-center shadow-md relative overflow-hidden ${
                    option.is_correct
                      ? "bg-gradient-to-br from-green-400 to-green-500 text-black"
                      : option.is_selected && !option.is_correct
                        ? "bg-gradient-to-br from-red-400 to-red-500 text-black"
                        : "bg-gradient-to-br from-[#2C4A6E] to-[#3A5A80]"
                  }`}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-bl-full opacity-10"></div>
                  <span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center mr-3 text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option.option_text}
                  {option.is_correct && <CheckCircle size={18} className="ml-auto text-black" />}
                  {option.is_selected && !option.is_correct && <XCircle size={18} className="ml-auto text-black" />}
                </motion.button>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="bg-gradient-to-br from-blue-50 to-white text-black p-5 rounded-xl mt-6 text-center w-full shadow-md"
            >
              <div className="flex items-center justify-center mb-2">
                <AlertCircle size={18} className="text-[#1E3A5F] mr-2" />
                <h3 className="font-semibold text-[#1E3A5F]">Pembahasan</h3>
              </div>
              <p className="text-sm text-gray-700">
                {currentQuestionData?.explanation || "Pembahasan tidak tersedia"}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="flex justify-between w-full mt-6"
            >
              <motion.button
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "#2E4A7F",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateQuestion("prev")}
                disabled={currentQuestion === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-md ${
                  currentQuestion === 1
                    ? "bg-gray-500 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-[#1E3A5F] to-[#2E4A7F]"
                }`}
              >
                <ArrowLeft size={16} />
                Sebelumnya
              </motion.button>

              <motion.button
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "#2E4A7F",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateQuestion("next")}
                disabled={currentQuestion === totalQuestions}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-md ${
                  currentQuestion === totalQuestions
                    ? "bg-gray-500 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-[#1E3A5F] to-[#2E4A7F]"
                }`}
              >
                Selanjutnya
                <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

