import { cn } from '@/lib/utils'

export interface TLoadingError {
  error?: string | null
  className?: string
}

export interface TContentLoader {
  children: React.ReactNode
  error?: string | null
  isLoading: boolean
  isError: boolean
  className?: string
}

export const Loading = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center justify-center bg-background', className)}>
      <div className="relative inline-flex">
        <div className="size-8 rounded-full bg-foreground"></div>
        <div className="absolute left-0 top-0 size-8 animate-ping rounded-full bg-foreground"></div>
        <div className="absolute left-0 top-0 size-8 animate-pulse rounded-full bg-foreground"></div>
      </div>
    </div>
  )
}

export const LoadingError = ({ error, className }: TLoadingError) => {
  return (
    <div className={cn('flex items-center justify-center bg-background', className)}>
      <div className="relative inline-flex">
        <div className="text-2xl text-foreground md:text-4xl">
          {error ?? <>Une erreur est survenue :(</>}
        </div>
      </div>
    </div>
  )
}

export const ContentLoader = ({
  error,
  isLoading,
  isError,
  children,
  className,
}: TContentLoader) => {
  return isError ? (
    <LoadingError error={error} className={className} />
  ) : isLoading ? (
    <Loading className={className} />
  ) : (
    <>{children}</>
  )
}
