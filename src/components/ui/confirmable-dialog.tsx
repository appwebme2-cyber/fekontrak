import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { CloseConfirmationDialog } from "./close-confirmation-dialog"

const ConfirmableDialog = DialogPrimitive.Root

const ConfirmableDialogTrigger = DialogPrimitive.Trigger

const ConfirmableDialogPortal = DialogPrimitive.Portal

const ConfirmableDialogClose = DialogPrimitive.Close

const ConfirmableDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
ConfirmableDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface ConfirmableDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  hasUnsavedChanges?: boolean
  onConfirmClose?: () => void
  confirmationTitle?: string
  confirmationDescription?: string
}

const ConfirmableDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ConfirmableDialogContentProps
>(({ 
  className, 
  children, 
  hasUnsavedChanges = false,
  onConfirmClose,
  confirmationTitle = "Apakah kamu ingin keluar?",
  confirmationDescription = "Data yang belum disimpan akan hilang.",
  ...props 
}, ref) => {
  const [showConfirmation, setShowConfirmation] = React.useState(false)

  const handleInteractOutside = (event: Event) => {
    if (hasUnsavedChanges) {
      event.preventDefault()
      setShowConfirmation(true)
    }
  }

  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    if (hasUnsavedChanges) {
      event.preventDefault()
      setShowConfirmation(true)
    }
  }

  const handleConfirmClose = () => {
    setShowConfirmation(false)
    onConfirmClose?.()
  }

  const handleCancelClose = () => {
    setShowConfirmation(false)
  }

  return (
    <ConfirmableDialogPortal>
      <ConfirmableDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        )}
        onInteractOutside={handleInteractOutside}
        onEscapeKeyDown={handleEscapeKeyDown}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>

      <CloseConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
        title={confirmationTitle}
        description={confirmationDescription}
      />
    </ConfirmableDialogPortal>
  )
})
ConfirmableDialogContent.displayName = DialogPrimitive.Content.displayName

const ConfirmableDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
ConfirmableDialogHeader.displayName = "ConfirmableDialogHeader"

const ConfirmableDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
ConfirmableDialogFooter.displayName = "ConfirmableDialogFooter"

const ConfirmableDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
    hasUnsavedChanges?: boolean
  }
>(({ className, children, hasUnsavedChanges, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  >
    {children}
    {hasUnsavedChanges && (
      <span className="ml-2 text-sm text-orange-500 font-normal">
        • Belum disimpan
      </span>
    )}
  </DialogPrimitive.Title>
))
ConfirmableDialogTitle.displayName = DialogPrimitive.Title.displayName

const ConfirmableDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
ConfirmableDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  ConfirmableDialog,
  ConfirmableDialogPortal,
  ConfirmableDialogOverlay,
  ConfirmableDialogClose,
  ConfirmableDialogTrigger,
  ConfirmableDialogContent,
  ConfirmableDialogHeader,
  ConfirmableDialogFooter,
  ConfirmableDialogTitle,
  ConfirmableDialogDescription,
}