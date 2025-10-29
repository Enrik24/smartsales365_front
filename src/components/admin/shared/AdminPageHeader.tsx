import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';

interface AdminPageHeaderProps {
  title: string;
  buttonLabel: string;
  onButtonClick: () => void;
}

const AdminPageHeader = ({ title, buttonLabel, onButtonClick }: AdminPageHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <Button onClick={onButtonClick}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {buttonLabel}
      </Button>
    </div>
  );
};

export default AdminPageHeader;
