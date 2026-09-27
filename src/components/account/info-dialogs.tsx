"use client"

import { AccountDialog, DialogActions } from "@/components/account/account-dialog"
import { useAccountSettings } from "@/components/account/use-account"
import { Button, buttonVariants } from "@/components/ui/button"

type DialogProps = { open: boolean; onOpenChange: (open: boolean) => void }

const QR_STEPS = [
  "Mở trang đăng nhập Mindo trên máy tính và chọn “Đăng nhập bằng mã QR”.",
  "Mở app Mindo trên điện thoại đã đăng nhập, chọn biểu tượng quét mã.",
  "Quét mã QR trên màn hình và xác nhận đăng nhập trên điện thoại.",
]

export function QrInfoDialog({ open, onOpenChange }: DialogProps) {
  return (
    <AccountDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Đăng nhập bằng mã QR"
      description="Đăng nhập web nhanh mà không cần nhập mật khẩu."
    >
      <ol className="flex flex-col gap-3">
        {QR_STEPS.map((step, i) => (
          <li key={step} className="flex gap-3 text-[13px] leading-5 text-foreground">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-info-soft text-xs font-bold text-link">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <DialogActions>
        <Button size="md" onClick={() => onOpenChange(false)}>
          Đã hiểu
        </Button>
      </DialogActions>
    </AccountDialog>
  )
}

export function DeleteAccountDialog({ open, onOpenChange }: DialogProps) {
  const settings = useAccountSettings()
  const supportUrl = settings.data?.support_center_url

  return (
    <AccountDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xoá tài khoản"
      description="Xoá tài khoản sẽ xoá vĩnh viễn hồ sơ, ví và toàn bộ dữ liệu của bạn."
    >
      <p className="rounded-control bg-warning-soft px-4 py-3 text-[13px] leading-5 text-warning-foreground">
        Để bảo vệ tài sản của bạn, yêu cầu xoá tài khoản được xử lý thủ công bởi đội ngũ hỗ trợ
        Mindo sau khi xác minh danh tính.
      </p>
      <DialogActions>
        <Button variant="outline" size="md" onClick={() => onOpenChange(false)}>
          Đóng
        </Button>
        {supportUrl && (
          <a
            href={supportUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ size: "md" })}
          >
            Liên hệ hỗ trợ
          </a>
        )}
      </DialogActions>
    </AccountDialog>
  )
}
