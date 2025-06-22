interface ProjectingOverlayProps {
  isVisible: boolean;
}

export const ProjectingOverlay = ({ isVisible }: ProjectingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-lg">
      <div className="p-8 text-center">
        <div className="animate-pulse">
          <h3 className="text-xl font-bold text-white mb-1">Otimizando exibição...</h3>
          <p className="text-white text-sm">Preparando visualização dos cenários finais</p>
        </div>
      </div>
    </div>
  );
};
