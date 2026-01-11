import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

interface LoginRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: () => void;
  onCancel?: () => void;
}

export function LoginRequiredModal({ open, onOpenChange, onLogin }: LoginRequiredModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Необхідна авторизація</DialogTitle>
          <DialogDescription>
            Функція збереження матеріалів доступна лише для зареєстрованих користувачів. 
            Будь ласка, увійдіть у свій обліковий запис, щоб зберігати обрані матеріали та отримати доступ до них з будь-якого пристрою.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Повернутись
          </Button>
          <Button onClick={onLogin}>
            Увійти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}