import React from 'react';
import { motion, Variants, RepeatType } from 'framer-motion';

const colors = [
  '#4A90E2', // Azul
  '#50C878', // Verde
  '#FF8C00', // Laranja
  '#FF4444', // Vermelho
  '#9B59B6', // Roxo
  '#FFD700', // Dourado
];

const dotVariants: Variants = {
  initial: {
    opacity: 0.3,
    scale: 1,
  },
  animate: {
    opacity: 1,
    scale: 1.4,
    transition: {
      duration: 0.9,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'reverse' as RepeatType,
    },
  },
};

const getDotStyle = (index: number): React.CSSProperties => {
  const angle = (index / 12) * 360;
  const radius = 35; // Aumentado para dar mais espaço (80/2 - 10/2)
  const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius + radius;
  const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius + radius;

  return {
    position: 'absolute',
    top: `${y}px`,
    left: `${x}px`,
    width: '10px', // Reduzido de 14px
    height: '10px', // Reduzido de 14px
    borderRadius: '50%',
    backgroundColor: colors[index % 6],
  };
};

const AuroraLoader = () => {
  return (
    <div className="relative w-20 h-20 mx-auto" aria-label="Carregando animação">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          style={getDotStyle(i)}
          variants={dotVariants}
          initial="initial"
          animate="animate"
        />
      ))}
    </div>
  );
};

export default AuroraLoader;
