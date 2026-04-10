import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminBackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/admin/dashboard')}
      className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      title="Retour au tableau de bord"
    >
      <ArrowLeft size={16} className="text-gray-600" />
    </button>
  );
};

export default AdminBackButton;