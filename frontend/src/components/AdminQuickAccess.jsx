import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminQuickAccess = () => {
  const navigate = useNavigate();

  // Afficher seulement en développement
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => navigate('/admin/login')}
        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-700 to-sky-800 hover:from-sky-800 hover:to-sky-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        title="Accès Admin"
      >
        <Shield size={20} className="group-hover:rotate-12 transition-transform" />
        <span className="font-medium">Admin</span>
      </button>
    </div>
  );
};

export default AdminQuickAccess;
