'use client';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';
export default function Home() {
  async function handleClick() {
    const response = await fetch('/api/hello');
    const data = await response.json();
    console.log(data);
    document.getElementById('test').textContent = data.message;
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">MapExplorer</h1>
      <p className="mt-4">Welcome to your Next.js app!</p>
      <Button onClick={handleClick}>Hey</Button>
      <div id="test"></div>
    </main>
  );
}
