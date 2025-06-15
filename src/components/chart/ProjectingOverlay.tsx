
interface ProjectingOverlayProps {
  isVisible: boolean;
}

export const ProjectingOverlay = ({ isVisible }: ProjectingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto mb-4"></div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">Otimizando exibição...</h3>
        <p className="text-gray-600 text-sm">Preparando visualização dos cenários finais</p>
      </div>
    </div>
  );
};
