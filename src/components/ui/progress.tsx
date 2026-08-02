
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    children?: React.ReactNode
    animated?: boolean
  }
>(({ className, value, children, animated = true, ...props }, ref) => {
  const [animatedValue, setAnimatedValue] = React.useState(0);

  React.useEffect(() => {
    if (animated && value) {
      const timer = setTimeout(() => {
        setAnimatedValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else if (!animated) {
      setAnimatedValue(value || 0);
    }
  }, [value, animated]);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      {children || (
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 bg-primary transition-all",
            animated && "progress-bar-fill"
          )}
          style={{ 
            transform: `translateX(-${100 - (animated ? animatedValue : (value || 0))}%)`,
            transitionDuration: animated ? "1.2s" : "0.3s"
          }}
        />
      )}
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
