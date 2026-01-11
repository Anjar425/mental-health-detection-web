import Link from "next/link"

export default function LoggedOutPage({ searchParams }: { searchParams?: { role?: string; reason?: string } }) {
  const role = (searchParams?.role as string) || "user"
  const reason = (searchParams?.reason as string) || "manual"

  const title = reason === "expired" ? "Sesi Anda Berakhir" : "Anda Telah Logout"
  const message =
    reason === "expired"
      ? "Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan."
      : "Anda telah berhasil logout. Sampai jumpa!"

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-xl w-full bg-card border border-border rounded-xl p-6 sm:p-8 text-center">
        <h1 className="text-lg sm:text-2xl font-bold mb-2">{title}</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-4">{message}</p>

        <div className="mb-4 text-xs sm:text-sm text-muted-foreground">
          Posisi terlogout: <strong className="text-foreground">{role}</strong>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/login" className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
            Login Kembali
          </Link>
          <Link href="/" className="inline-flex items-center justify-center px-4 py-2 border border-border rounded-md text-sm text-muted-foreground">
            Kembali ke Beranda
          </Link>
        </div>

        <p className="text-[10px] sm:text-xs text-muted-foreground mt-4">
          Jika Anda tidak melakukan logout dan mengira ini kesalahan, periksa koneksi atau hubungi admin.
        </p>
      </div>
    </main>
  )
}
