import { useEffect, useState } from "react";

type Photocard = {
  id: number;
  name: string;
  group: string;
  artist: string;
  category: string;
  image: string;
};

export default function App() {
  const [groups, setGroups] = useState<string[]>([]); // Liste des groupes
  const [artists, setArtists] = useState<string[]>([]); // Liste des artistes
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all"); // Groupe sélectionné
  const [artistFilter, setArtistFilter] = useState("all"); // Artiste sélectionné
  const [categories, setCategories] = useState<string[]>([]); // Catégories sélectionnées

  const photocards: Photocard[] = [
    { id: 1, name: "Jungkook Dynamite", group: "BTS", artist: "Jungkook", category: "Album", image: "https://via.placeholder.com/400" },
    { id: 2, name: "Jennie Solo", group: "BLACKPINK", artist: "Jennie", category: "Other", image: "https://via.placeholder.com/400" },
    { id: 3, name: "Nayeon Feel Special", group: "TWICE", artist: "Nayeon", category: "Album", image: "https://via.placeholder.com/400" },
    { id: 4, name: "Jimin Butter", group: "BTS", artist: "Jimin", category: "Album", image: "https://via.placeholder.com/400" },
    { id: 5, name: "Lisa LALISA", group: "BLACKPINK", artist: "Lisa", category: "Benefit", image: "https://via.placeholder.com/400" },
    { id: 6, name: "Momo More & More", group: "TWICE", artist: "Momo", category: "Event", image: "https://via.placeholder.com/400" },
  ];

  // Charger les groupes depuis l'API au démarrage
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("http://localhost:7070/api/groups");
        const data = await response.json();
        setGroups(data.map((group: { groups_name: string }) => group.groups_name));
      } catch (error) {
        console.error("Erreur lors de la récupération des groupes :", error);
      }
    };
    fetchGroups();
  }, []);

  // Charger les artistes basés sur le groupe sélectionné
  useEffect(() => {
    if (groupFilter !== "all") {
      const fetchArtists = async () => {
        try {
          const response = await fetch(`http://localhost:7070/api/artists/${groupFilter}`);
          if (!response.ok) throw new Error("Erreur réseau");
          const data = await response.json();
          setArtists(data.artists.map((artist: { stage_name: string }) => artist.stage_name));
        } catch (error) {
          console.error("Erreur lors de la récupération des artistes :", error);
        }
      };
      fetchArtists();
    } else {
      setArtists([]);
    }
  }, [groupFilter]);
  

  // Logique pour filtrer les photocards
  const filteredPhotocards = photocards.filter((photocard) => {
    const matchesQuery = query === "" || photocard.name.toLowerCase().includes(query.toLowerCase());
    const matchesGroup = groupFilter === "all" || photocard.group === groupFilter;
    const matchesArtist = artistFilter === "all" || photocard.artist === artistFilter;
    const matchesCategory = categories.length === 0 || categories.includes(photocard.category);

    return matchesQuery && matchesGroup && matchesArtist && matchesCategory;
  });

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-100 p-8">
      <h1 className="text-4xl font-bold text-center text-purple-700 mb-8">BiasFinder - Photocard Trading</h1>

      {/* Barre de recherche */}
      <form className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher des photocards..."
          className="flex-grow max-w-lg px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-300"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-md hover:bg-purple-700"
        >
          Rechercher
        </button>
      </form>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-300 bg-white"
        >
          <option value="all">Tous les groupes</option>
          {groups.map((group, index) => (
            <option key={index} value={group}>
              {group}
            </option>
          ))}
        </select>

        <select
          value={artistFilter}
          onChange={(e) => setArtistFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-300 bg-white"
          disabled={artists.length === 0}
        >
          <option value="all">Tous les artistes</option>
          {artists.map((artist, index) => (
            <option key={index} value={artist}>
              {artist}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          {["Album", "Other", "Benefit", "Event"].map((category) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`px-4 py-2 rounded-md shadow-sm ${
                categories.includes(category)
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Résultats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotocards.map((photocard) => (
          <div key={photocard.id} className="bg-white shadow-md rounded-lg overflow-hidden transform transition duration-300 hover:scale-105">
            <img src={photocard.image} alt={photocard.name} className="object-cover w-full h-48" />
            <div className="p-4">
              <h2 className="font-bold text-lg text-gray-800">{photocard.name}</h2>
              <p className="text-sm text-gray-600">Groupe : {photocard.group}</p>
              <p className="text-sm text-gray-600">Artiste : {photocard.artist}</p>
              <p className="text-sm text-gray-600">Catégorie : {photocard.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
