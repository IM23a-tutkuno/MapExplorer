import './globals.css';

export const metadata = {
  title: 'MapExplorer',
  description: 'Map Explorer Application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
