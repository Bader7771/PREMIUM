import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  ShoppingBag,
  Clock,
  X,
  Check,
  Sun,
  LockKeyhole,
  Menu,
  Search,
  Plus,
  Minus,
  Trash2,
  Coffee,
  CakeSlice,
  Sandwich,
  Milk,
  CookingPot,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  SlidersHorizontal,
  CreditCard,
  ChevronDown,
  Send,
  Smile as SmileIcon,
  type LucideIcon,
} from "lucide-react";
const icons = {
  bag: ShoppingBag,
  arrow: ArrowRight,
  diagonal: ArrowUpRight,
  back: ArrowLeft,
  clock: Clock,
  close: X,
  check: Check,
  sun: Sun,
  lock: LockKeyhole,
  menu: Menu,
  search: Search,
  plus: Plus,
  minus: Minus,
  trash: Trash2,
  brunch: Sun,
  boards: CookingPot,
  savory: Sandwich,
  sweet: CakeSlice,
  extras: Sparkles,
  drinks: Coffee,
  milk: Milk,
  phone: Phone,
  mail: Mail,
  pin: MapPin,
  calendar: CalendarDays,
  customize: SlidersHorizontal,
  payment: CreditCard,
  down: ChevronDown,
  send: Send,
  smile: SmileIcon,
} satisfies Record<string, LucideIcon>;
export type IconName = keyof typeof icons;
export function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const Svg = icons[name];
  return (
    <Svg
      className={`icon ${className}`}
      size={20}
      strokeWidth={1.7}
      aria-hidden="true"
      focusable="false"
    />
  );
}
export function Smile({ className = "" }: { className?: string }) {
  return (
    <SmileIcon
      className={className}
      strokeWidth={1.5}
      aria-hidden="true"
      focusable="false"
    />
  );
}
