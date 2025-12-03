interface StyleChipProps {
  label: string;
  onClick?: () => void;
}

const StyleChip = ({ label, onClick }: StyleChipProps) => {
  return (
    <button 
      onClick={onClick}
      className="whitespace-nowrap rounded-[24px] bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/90 active:scale-95"
    >
      {label}
    </button>
  );
};

export default StyleChip;
