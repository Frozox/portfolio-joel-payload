import { cn } from '@/lib/utils'

interface TitleProps {
  className?: string
  h1: string
  h2?: string
  h3?: string
}

function Title({ className, h1, h2, h3 }: TitleProps) {
  return (
    <div className={className}>
      <div className="inline-flex w-full items-center justify-center">
        <h1
          data-char={h1.charAt(0).toUpperCase()}
          className={cn(
            'after:absolute after:left-1/2 after:-z-[1] after:-translate-x-1/2 after:-translate-y-10 after:text-8xl after:text-zinc-300 after:content-[attr(data-char)] after:dark:text-zinc-500',
          )}
        >
          <span className="text-4xl before:inline-block before:h-[2px] before:bg-foreground before:align-middle after:inline-block after:h-[2px] after:bg-foreground after:align-middle before:sm:mr-4 before:sm:w-8 after:sm:ml-4 after:sm:w-8">
            {h1.toUpperCase()}
          </span>
        </h1>
      </div>
      {h2 && (
        <h2 className="mt-10 flex w-full justify-center text-center text-2xl sm:text-3xl">{h2}</h2>
      )}
      {h3 && (
        <h3 className="mt-8 flex w-full justify-center text-center text-xl sm:mt-10 sm:text-2xl">
          {h3}
        </h3>
      )}
    </div>
  )
}

export { Title }
