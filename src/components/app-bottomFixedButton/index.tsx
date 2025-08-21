import { twMerge } from "tailwind-merge";
import { Button } from "../ui/button";

interface AppFixedButtonProps {
  icon?: React.ComponentType<any>;
  className?: string;
  onClick?: () => void;
}

export default function AppFixedButton({ icon: Icon, className, onClick }: AppFixedButtonProps) {
  return (
    <div className={twMerge("p-3 flex items-center justify-center rounded-lg shadow cursor-pointer transition-colors", className)}>
      {Icon && <Icon size={16} />}
    </div>
  );
}