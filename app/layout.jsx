import "./globals.css";

export const metadata = {
  title: "Elaina - Store Dashboard",
  description: "Admin dashboard for Elaina - Store Telegram bot",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
