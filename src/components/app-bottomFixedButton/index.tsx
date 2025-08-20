import { twMerge } from "tailwind-merge";
import { Button } from "../ui/button";

interface AppFixedButtonProps {
  icon?: React.ComponentType<any>;
  className?: string;
  onClick?: () => void;
}

export default function AppFixedButton({ icon: Icon, className, onClick }: AppFixedButtonProps) {
  return (
    <Button variant={'outline'} size={'icon'} className={twMerge("transition-colors cursor-pointer", className)} onClick={onClick}>
      {Icon && <Icon size={16} />}
    </Button>
  );
}