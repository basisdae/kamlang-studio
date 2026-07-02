type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-[24px] bg-white p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}