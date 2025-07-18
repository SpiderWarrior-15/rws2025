// src/pages/ImageCreator.tsx
import React, { useState } from 'react';

export function ImageCreator() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generateImage() {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setError('');
    setLoading(true);
    setImageUrl('');

    try {
      // TODO: Replace with actual AI image generation API call
      await new Promise((r) => setTimeout(r, 2000));
      const fakeImageUrl = 'https://via.placeholder.com/512x512.png?text=' + encodeURIComponent(prompt);
      setImageUrl(fakeImageUrl);
    } catch {
      setError('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-4">AI Image Creator 🎨 (Admin Only)</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Enter a prompt and generate an image using Leonardo da Vinci style AI.
      </p>
      <input
        type="text"
        className="w-full p-3 rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
        placeholder="Describe the image you want..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={generateImage}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 rounded transition"
      >
        {loading ? 'Generating...' : 'Generate Image'}
      </button>
      {error && <p className="mt-3 text-red-500">{error}</p>}
      {imageUrl && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Generated Image:</h2>
          <img
            src={imageUrl}
            alt={`AI generated for prompt: ${prompt}`}
            className="rounded shadow-md w-full"
          />
        </div>
      )}
    </div>
  );
}
