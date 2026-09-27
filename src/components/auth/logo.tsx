import Image from "next/image"
import { cn } from "cn"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-8 items-center gap-2", className)}>
      <Image
        src="/logo.jpg"
        alt=""
        width={32}
        height={32}
        priority
        className="size-8 rounded-full object-contain"
      />
      <span className="text-[23px] leading-8 font-bold text-foreground">
        Mindo
      </span>
    </div>
  )
}
