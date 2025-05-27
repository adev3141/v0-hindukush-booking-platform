// Simple toast implementation for demo purposes
export const toast = (options: { title: string; description: string; variant?: "default" | "destructive" }) => {
  // In a real app, this would use a proper toast library
  const message = `${options.title}: ${options.description}`
  if (options.variant === "destructive") {
    alert(`❌ ${message}`)
  } else {
    alert(`✅ ${message}`)
  }
}

export const useToast = () => {
  return { toast }
}
