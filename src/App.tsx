import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import About from './pages/About';
import Home from './pages/Home';
import { ArticlePage, JournalIndex } from './pages/Journal';
import NotFound from './pages/NotFound';
import { ConsultationPage, ContactPage, LegalPage, ProcessPage } from './pages/Other';
import { ProjectDetail, ProjectsIndex } from './pages/Projects';
import { ServiceDetail, ServicesIndex } from './pages/Services';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="services" element={<ServicesIndex />} />
        <Route path="services/:slug" element={<ServiceDetail />} />
        <Route path="projects" element={<ProjectsIndex />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="process" element={<ProcessPage />} />
        <Route path="journal" element={<JournalIndex />} />
        <Route path="journal/:slug" element={<ArticlePage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="consultation" element={<ConsultationPage />} />
        <Route path="privacy" element={<LegalPage kind="privacy" />} />
        <Route path="terms" element={<LegalPage kind="terms" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
