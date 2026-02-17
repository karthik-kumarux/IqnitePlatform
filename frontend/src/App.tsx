import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateQuiz from './pages/CreateQuiz';
import QuizDetails from './pages/QuizDetails';
import OrganizerQuizLiveDashboard from './pages/OrganizerQuizLiveDashboard';
import ParticipantDashboard from './pages/ParticipantDashboard';
import TakeQuiz from './pages/TakeQuiz';
import QuizResults from './pages/QuizResults';
import JoinQuiz from './pages/JoinQuiz';
import TakeQuizGuest from './pages/TakeQuizGuest';
import GuestQuizResults from './pages/GuestQuizResults';
import LobbyWaitingRoom from './pages/LobbyWaitingRoom';
import OrganizerLobbyControl from './pages/OrganizerLobbyControl';

const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Public Quiz Join Routes - No Auth Required */}
          <Route path="/join" element={<JoinQuiz />} />
          <Route path="/quiz/:id/lobby" element={<LobbyWaitingRoom />} />
          <Route path="/quiz/:id/take" element={<TakeQuizGuest />} />
          <Route path="/quiz/:id/results" element={<GuestQuizResults />} />
          
          {/* Organizer Routes */}
          <Route
            path="/organizer"
            element={
              <PrivateRoute allowedRoles={['ORGANIZER']}>
                <OrganizerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/organizer/quiz/new"
            element={
              <PrivateRoute allowedRoles={['ORGANIZER']}>
                <CreateQuiz />
              </PrivateRoute>
            }
          />
          <Route
            path="/organizer/quiz/:id"
            element={
              <PrivateRoute allowedRoles={['ORGANIZER']}>
                <QuizDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/organizer/quiz/:id/live"
            element={
              <PrivateRoute allowedRoles={['ORGANIZER']}>
                <OrganizerQuizLiveDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/organizer/quiz/:id/lobby"
            element={
              <PrivateRoute allowedRoles={['ORGANIZER']}>
                <OrganizerLobbyControl />
              </PrivateRoute>
            }
          />
          <Route
            path="/organizer/quiz/:id/edit"
            element={
              <PrivateRoute allowedRoles={['ORGANIZER']}>
                <CreateQuiz />
              </PrivateRoute>
            }
          />

          {/* Participant Routes */}
          <Route
            path="/participant"
            element={
              <PrivateRoute allowedRoles={['PARTICIPANT']}>
                <ParticipantDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/participant/quiz/:id/take"
            element={
              <PrivateRoute allowedRoles={['PARTICIPANT']}>
                <TakeQuiz />
              </PrivateRoute>
            }
          />
          <Route
            path="/participant/quiz/:id/results/:sessionId"
            element={
              <PrivateRoute allowedRoles={['PARTICIPANT']}>
                <QuizResults />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
