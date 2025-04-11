import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Materials&Textures</title>
        <meta name="description" content="Materials&Textures Assignment" />
      </head>
      <body>{children}</body>
    </html>
  );
}
