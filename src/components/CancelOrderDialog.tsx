import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  orderId?: string;
}

const CancelOrderDialog = ({ open, onOpenChange, onConfirm, orderId }: CancelOrderDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-[24px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">Отменить заказ?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {orderId && (
              <>
                Вы уверены, что хотите отменить заказ №{orderId}? Это действие нельзя отменить.
              </>
            )}
            {!orderId && "Вы уверены, что хотите отменить этот заказ? Это действие нельзя отменить."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel>Нет, оставить</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Да, отменить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelOrderDialog;

