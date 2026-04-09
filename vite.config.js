import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },
  assetsInclude: ['**/*.min.js'],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':   ['react', 'react-dom', 'react-router-dom'],
          'jspdf-vendor':   ['jspdf'],
          'student':        [
            './src/components/Student/StudentDashboard.jsx',
            './src/components/Student/StudentSignup.jsx',
            './src/components/Student/MarksheetUpload.jsx',
            './src/components/Student/AIMarksheetUpload.jsx',
          ],
          'teacher':        [
            './src/components/Teacher/TeacherDashboard.jsx',
            './src/components/Teacher/TeacherSignup.jsx',
            './src/components/Teacher/MeritList.jsx',
            './src/components/Teacher/TeacherMarksheetParser.jsx',
          ],
          'recruiter':      [
            './src/components/Recruiter/RecruiterDashboard.jsx',
            './src/components/Recruiter/RecruiterSignup.jsx',
            './src/components/Recruiter/RecruiterLogin.jsx',
          ],
        },
      },
    },
  },
})
