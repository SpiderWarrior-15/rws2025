// src/pages/ArtGallery.tsx
import React, { useEffect, useState } from 'react';

// Mock data fetch functions (replace with real API calls or file reading)
async function fetchGallery() {
  // Simulate fetching approved artworks
  return [
    {
      id: '1',
      username: 'Warrior1',
      caption: 'Epic battle scene',
      imageUrl: '/uploads/art/battle1.jpg',
    },
    {
      id: '2',
      username: 'Warrior2',
      caption: 'Mystic forest',
      imageUrl: '/uploads/art/forest.jpg',
    },
  ];
}

async function fetchPendingSubmissions() {
  // For admins only: pending artworks to approve
  return [
    {
      id: '3',
      username: 'Warrior3',
      caption: 'Dragon rider',
      imageUrl: '/uploads/art/dragon.jpg',
    },
  ];
}

export function ArtGallery() {
  const [gallery, setGallery] = useState([]);
  const [pending, setPending] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); // Change as per auth
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const approved = await fetchGallery();
      setGallery(approved);

      // Simulate admin check
      const admin = true; // Replace with actual auth logic
      setIsAdmin(admin);

      if (admin) {
        const pendingSubs = await fetchPendingSubmissions();
        setPending(pendingSubs);
      }
      setLoading(false);
    }
    load();
  }, []);

  function approveArtwork(id: string) {
    // Implement approval logic here (API call or file update)
    alert(`Artwork ${id} approved! (Add backend logic)`);
    // Update UI by removing from pending and adding to gallery...
  }

  if (loading) return <p className="p-6 text-center">Loading gallery...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Warriors' Art Gallery</h1>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Approved Artworks</h2>
        {gallery.length === 0 && <p>No artworks approved yet.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gallery.map((art: any) => (
            <div key={art.id} className="border rounded-lg overflow-hidden shadow-lg">
              <img src={art.imageUrl} alt={art.caption} className="w-full h-48 object-cover" />
              <div className="p-4">
                <p className="font-semibold">{art.username}</p>
                <p className="text-gray-600">{art.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {isAdmin && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Pending Submissions</h2>
          {pending.length === 0 && <p>No pending submissions.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {pending.map((art: any) => (
              <div
                key={art.id}
                className="border rounded-lg overflow-hidden shadow-lg relative"
              >
                <img src={art.imageUrl} alt={art.caption} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <p className="font-semibold">{art.username}</p>
                  <p className="text-gray-600">{art.caption}</p>
                  <button
                    onClick={() => approveArtwork(art.id)}
                    className="mt-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
