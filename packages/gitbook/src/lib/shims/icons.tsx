import * as React from 'react';

// => ENUM, bukan type, supaya tersedia sebagai value saat di-import
export enum IconStyle {
  line = 'line',
  solid = 'solid',
  regular = 'regular',
  duotone = 'duotone',
  rounded = 'rounded',
  sharp = 'sharp',
}

type IconProps = React.SVGProps<SVGSVGElement> & {
  name?: string;
  className?: string;
  size?: number | string;
  styleName?: IconStyle;
};

// Komponen Icon dummy (placeholder)
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(function Icon(
  { className, size = 16, ...rest },
  ref
) {
  return (
    <svg
      ref={ref}
      width={Number(size)}
      height={Number(size)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
    </svg>
  );
});

// Provider dummy buat kompatibilitas
export const IconsProvider: React.FC<{ style?: IconStyle; children?: React.ReactNode }> = ({
  children,
}) => <>{children}</>;

// (opsional) re-export beberapa ikon populer dari lucide
export {
  Sun as SunBright,
  Monitor as Desktop,
  GitPullRequest as CodePullRequest,
  ChevronDown,
  ChevronRight,
  Moon,
  Hash as Hashtag,
  AlertCircle as CircleExclamation,
  Info as CircleInfo,
  BookOpen,
  Send,
  X as Close,
  Search,
  Copy,
  ExternalLink,
} from 'lucide-react';
