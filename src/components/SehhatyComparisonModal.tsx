import React from 'react';
import { Language } from '../types';
import { SehhatyComparisonCard } from './SehhatyComparisonCard';

interface SehhatyComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const SehhatyComparisonModal: React.FC<SehhatyComparisonModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="sehhaty-comparison-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="sehhaty-comparison-modal-dialog"
        className="w-full max-w-5xl my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <SehhatyComparisonCard lang={lang} onClose={onClose} isModal={true} />
      </div>
    </div>
  );
};
