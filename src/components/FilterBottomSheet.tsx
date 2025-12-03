import { useState, useEffect } from "react";
import { Calendar, Search } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface FilterData {
  date?: Date;
  priceRange: [number, number];
  selectedTypes: string[];
  searchQuery: string;
  nearby?: boolean;
}

interface FilterBottomSheetProps {
  children?: React.ReactNode;
  onApplyFilters?: (filters: FilterData) => void;
  initialFilters?: FilterData;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const musicianTypes = [
  "DJ",
  "Вокалист",
  "Группа",
  "Инструменталист",
  "Дуэт",
  "Cover band",
  "Ведущий",
];

const FilterBottomSheet = ({ children, onApplyFilters, initialFilters, open: controlledOpen, onOpenChange }: FilterBottomSheetProps) => {
  const [date, setDate] = useState<Date | undefined>(initialFilters?.date);
  const [priceRange, setPriceRange] = useState<[number, number]>(
    initialFilters?.priceRange || [5000, 50000]
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialFilters?.selectedTypes || []);
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || "");
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  };

  useEffect(() => {
    if (initialFilters) {
      setDate(initialFilters.date);
      setPriceRange(initialFilters.priceRange || [5000, 50000]);
      setSelectedTypes(initialFilters.selectedTypes || []);
      setSearchQuery(initialFilters.searchQuery || "");
    }
  }, [initialFilters]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleApplyFilters = () => {
    const filters: FilterData = {
      date,
      priceRange,
      selectedTypes,
      searchQuery,
      nearby: initialFilters?.nearby,
    };
    onApplyFilters?.(filters);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent side="bottom" className="h-[80vh] rounded-t-[24px]">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold">Фильтры</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto pb-24" style={{ maxHeight: "calc(80vh - 140px)" }}>
          {/* Date Picker */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Выберите дату
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Выберите дату</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Musician Type */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-foreground">
              Тип исполнителя
            </label>
            <div className="space-y-3">
              {musicianTypes.map((type) => (
                <div key={type} className="flex items-center gap-3">
                  <Checkbox
                    id={type}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => toggleType(type)}
                  />
                  <label
                    htmlFor={type}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-foreground">
              Цена: от {priceRange[0].toLocaleString()} ₽
            </label>
            <Slider
              value={[priceRange[0]]}
              onValueChange={(value) => setPriceRange([value[0], 100000])}
              min={0}
              max={100000}
              step={1000}
              className="w-full"
            />
          </div>

          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Поиск
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Введите имя музыканта"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Fixed Button at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background p-4">
          <SheetClose asChild>
            <Button
              onClick={handleApplyFilters}
              className="h-[60px] w-full rounded-[20px] bg-primary text-lg font-bold text-primary-foreground hover:bg-primary/90"
            >
              Показать музыкантов
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterBottomSheet;
