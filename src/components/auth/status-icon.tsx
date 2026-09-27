import { cn } from "cn"

type StatusIconProps = {
  variant: "success" | "success-solid" | "error"
  className?: string
}

/**
 * Round status badge.
 * - `success`: large soft-lime ring with navy check (Đăng ký / Đổi mật khẩu thành công)
 * - `success-solid`: 72px solid lime with white check (QR đã quét / thành công)
 * - `error`: 72px solid red with "!" (QR bị từ chối)
 */
export function StatusIcon({ variant, className }: StatusIconProps) {
  if (variant === "success") {
    return (
      <div
        className={cn(
          "flex size-[84px] items-center justify-center rounded-full bg-success-soft",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/success-check.svg" alt="" width={38} height={38} />
      </div>
    )
  }

  return (
    <div
      aria-hidden
      className={cn(
        "flex size-[72px] items-center justify-center rounded-full text-[34px] leading-[72px] font-bold text-white",
        variant === "error" ? "bg-destructive" : "bg-success",
        className
      )}
    >
      {variant === "error" ? "!" : "✓"}
    </div>
  )
}
