interface LoadingSkeletonProps {
  className?: string
  variant?: "card" | "text" | "avatar" | "button"
}

export default function LoadingSkeleton({ className = "", variant = "card" }: LoadingSkeletonProps) {
  const variants = {
    card: "h-64 w-full rounded-lg",
    text: "h-4 w-full rounded",
    avatar: "h-12 w-12 rounded-full",
    button: "h-10 w-24 rounded-md",
  }

  return <div className={`skeleton ${variants[variant]} ${className}`} />
}
