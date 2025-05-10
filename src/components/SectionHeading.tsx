
import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
};

const SectionHeading = ({ 
  title, 
  subtitle, 
  centered = false,
  className 
}: SectionHeadingProps) => {
  return (
    <div className={cn(
      'mb-10',
      centered && 'text-center',
      className
    )}>
      <h2 className="text-3xl md:text-4xl font-bold text-jewelry-dark mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-jewelry-gray text-lg max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
