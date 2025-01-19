import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


type Photocard = {
  id: number;
  name: string;
  image: string;
  type: string;
  artistName: string;
  groupName: string;
};

export default function Home() {
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  const [artists, setArtists] = useState<{ id: number; name: string }[]>([]);
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [artistFilter, setArtistFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [photocards, setPhotocards] = useState<Photocard[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [userId, setUserId] = useState(1); // Simule un utilisateur connecté
  const [isAdmin, setIsAdmin] = useState(false); // Gère le mode admin
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [owned, setOwned] = useState<number[]>([]);

  const categoryLabels: Record<string, string> = {
    PCA: "Album",
    PCO: "Other",
    POB: "Benefit",
    PCE: "Event",
  };

  // Charger la liste des groupes
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("http://localhost:7070/api/groupslist");
        const data = await response.json();
        setGroups(
          data.map((group: { groups_id: number; groups_name: string }) => ({
            id: group.groups_id,
            name: group.groups_name,
          }))
        );
      } catch (error) {
        console.error("Erreur lors de la récupération des groupes :", error);
      }
    };
    fetchGroups();
  }, []);

  // Charger les artistes du groupe sélectionné
  useEffect(() => {
    if (groupFilter !== "all") {
      const fetchArtists = async () => {
        try {
          const response = await fetch(
            `http://localhost:7070/api/groups/${groupFilter}/artists`
          );
          if (!response.ok) throw new Error("Erreur réseau");
          const data = await response.json();
          setArtists(
            data.map((artist: { artists_id: number; stage_name: string }) => ({
              id: artist.artists_id,
              name: artist.stage_name,
            }))
          );
        } catch (error) {
          console.error("Erreur lors de la récupération des artistes :", error);
        }
      };
      fetchArtists();
    } else {
      setArtists([]);
    }
  }, [groupFilter]);

  // Fonction pour aller chercher les photocards
  const fetchPhotocards = async (reset = false) => {
    setLoading(true);
    const nextPage = reset ? 1 : page;
    let url = `http://localhost:7070/api/photocards?page=${nextPage}&size=24`;

    if (groupFilter !== "all") {
      url += `&groupId=${groupFilter}`;
    }
    if (artistFilter !== "all") {
      url += `&artistId=${artistFilter}`;
    }

    try {
      console.log("Fetching photocards from:", url);
      const response = await fetch(url);
      const data = await response.json();

      // Vérifie s’il y a encore des résultats à paginer
      if (data.length < 24) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      const formattedData = data.map((pc: any) => ({
        id: pc.pc_id,
        name: pc.pc_name,
        image: pc.url,
        type: pc.pc_type,
        artistName: pc.artist_name,
        groupName: pc.group_name,
      }));

      if (reset) {
        setPhotocards(formattedData);
        setPage(2);
      } else {
        setPhotocards((prev) => [...prev, ...formattedData]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des photocards :", error);
    }
    setLoading(false);
  };

  // Charger la collection (owned/wishlist) de l’utilisateur courant
  const fetchUserCollections = async () => {
    // Si userId = 0 => mode Admin => pas de collection
    if (userId === 0) {
      setWishlist([]);
      setOwned([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:7070/api/users/${userId}/collection`
      );
      const data = await response.json();
      // Récupère uniquement l’ID des photocards possédées
      const ownedIds = data.map((item: any) => item.pc_id);

      setOwned(ownedIds);
      setWishlist([]); // Si tu gères la wishlist différemment, adapte ici
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la collection de l'utilisateur :",
        error
      );
      setWishlist([]);
      setOwned([]);
    }
  };

  // Charger en même temps collection et photocards lorsqu’on change user/groupe/artiste
  useEffect(() => {
    const loadData = async () => {
      await fetchUserCollections(); 
      await fetchPhotocards(true); // Reset pagination à chaque changement
    };
    loadData();
  }, [userId, groupFilter, artistFilter]);

  // Re-charger la collection (si besoin) lorsqu’on change de user
  // (Ici c’est un exemple, donc potentiellement redondant)
  useEffect(() => {
    if (userId !== 0) {
      fetchUserCollections();
    } else {
      setWishlist([]);
      setOwned([]);
    }
  }, [userId]);

  // Debug : surveille les changements de wishlist/owned
  useEffect(() => {
    console.log("Wishlist mise à jour :", wishlist);
    console.log("Possédé mis à jour :", owned);
  }, [wishlist, owned]);

  // Changer d'utilisateur
  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    setUserId(selectedId);
    setIsAdmin(selectedId === 0);
    // Recharge la collection pour ce nouvel utilisateur
    fetchUserCollections().then(() => fetchPhotocards(true));
  };

  // Ajouter / retirer de la wishlist
  const handleWishlistToggle = async (photocardId: number) => {
    const inWishlist = wishlist.includes(photocardId);
    try {
      await fetch(`http://localhost:7070/api/users/${userId}/photocards`, {
        method: inWishlist ? "DELETE" : "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          photocardId: photocardId.toString(),
          have: "false",
        }),
      });

      // Mise à jour locale immédiate
      setWishlist((prev) =>
        inWishlist ? prev.filter((id) => id !== photocardId) : [...prev, photocardId]
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la wishlist :", error);
    }
  };

  // Ajouter / retirer de la collection (possédés)
  const handleOwnedToggle = async (photocardId: number) => {
    const inOwned = owned.includes(photocardId);
    try {
      await fetch(`http://localhost:7070/api/users/${userId}/photocards`, {
        method: inOwned ? "DELETE" : "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          photocardId: photocardId.toString(),
          have: "true",
        }),
      });

      // Mise à jour locale immédiate
      setOwned((prev) =>
        inOwned ? prev.filter((id) => id !== photocardId) : [...prev, photocardId]
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la collection :", error);
    }
  };

  // Pour centraliser l’action (wishlist vs owned) – non indispensable si on utilise les deux fonctions au-dessus
  const handlePhotocardAction = async (photocardId: number, have: boolean) => {
    if (userId === 0) {
      setNotification("❌ Impossible : Vous êtes en mode Admin !");
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      const response = await fetch("http://localhost:7070/api/user/photocard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          photocardId: photocardId,
          have: have,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la liste de l'utilisateur");
      }

      setNotification(
        `✅ Photocard ${photocardId} ${have ? "ajoutée aux possédés" : "ajoutée à la wishlist"} !`
      );
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la photocard :", error);
      setNotification("❌ Erreur lors de l'ajout !");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Filtrer en fonction de la recherche + catégories
  const filteredPhotocards = photocards.filter((photocard) => {
    const matchesQuery =
      query === "" || photocard.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory =
      categories.length === 0 || categories.includes(photocard.type);
    return matchesQuery && matchesCategory;
  });

  // Activer / désactiver un filtre de type (catégorie)
  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // Chargement de la page suivante
  const loadMorePhotocards = () => {
    if (!loading && hasMore) {
      fetchPhotocards();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-100 p-8">
      {/* Notification flottante (si besoin) */}
      {notification && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-md shadow-md">
          {notification}
        </div>
      )}
    {/* Sélecteur d’utilisateur (avec “Voir mon profil”) */}
    <div className="absolute top-4 left-4 flex items-center gap-2">
      <label className="text-gray-700 font-bold">Utilisateur :</label>
      <select
        value={userId}
        onChange={handleUserChange}
        className="ml-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-300 bg-white"
      >
        <option value="0">👑 Admin</option>
        <option value="1">Utilisateur 1</option>
        <option value="2">Utilisateur 2</option>
        <option value="3">Utilisateur 3</option>
      </select>

      {/* BOUTON VOIR PROFIL */}
      <Link
        to={`/profile/${userId}`}
        className="bg-purple-500 text-white px-4 py-2 rounded-md"
      >
        Voir mon profil
      </Link>

      {/* BOUTON PAGE ADMIN (optionnel), visible seulement si userId=0 */}
      {userId === 0 && (
        <Link
          to="/admin"
          className="bg-red-500 text-white px-4 py-2 rounded-md"
        >
          Page Admin
        </Link>
      )}
    </div>


      {/* Barre de recherche */}
      <form className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher des photocards..."
          className="flex-grow max-w-lg px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-300"
        />
      </form>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-300 bg-white"
        >
          <option value="all">Tous les groupes</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
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
          {artists.map((artist) => (
            <option key={artist.id} value={artist.id}>
              {artist.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          {["PCA", "PCO", "POB", "PCE"].map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-4 py-2 rounded-md shadow-sm ${
                categories.includes(cat)
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Grille de photocards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotocards.map((photocard) => (
          <div
            key={photocard.id}
            className="bg-white shadow-md rounded-lg overflow-hidden transform transition duration-300 hover:scale-105"
          >
            <img
              src={photocard.image}
              alt={photocard.name}
              className="object-cover w-full h-48"
            />
            <div className="p-4">
              <h2 className="font-bold text-lg text-gray-800">{photocard.name}</h2>
              <p className="text-sm text-gray-600">
                Groupe : {photocard.groupName || "Inconnu"}
              </p>
              <p className="text-sm text-gray-600">
                Artiste : {photocard.artistName || "Inconnu"}
              </p>
              <p className="text-sm text-gray-600">
                Catégorie : {photocard.type || "Inconnue"}
              </p>

              <div className="mt-2 flex gap-2">
                {/* Bouton wishlist */}
                <button
                  className={`px-3 py-1 text-white font-semibold rounded-md ${
                    wishlist.includes(photocard.id)
                      ? "bg-red-600"
                      : "bg-gray-400"
                  }`}
                  onClick={() => handleWishlistToggle(photocard.id)}
                  disabled={owned.includes(photocard.id)} 
                >
                  {wishlist.includes(photocard.id)
                    ? "❤️ Wishlist"
                    : "🤍 Ajouter"}
                </button>

                {/* Bouton possédé */}
                <button
                  className={`px-3 py-1 text-white font-semibold rounded-md ${
                    owned.includes(photocard.id)
                      ? "bg-green-600"
                      : "bg-gray-400"
                  }`}
                  onClick={() => handleOwnedToggle(photocard.id)}
                  disabled={wishlist.includes(photocard.id)} 
                >
                  {owned.includes(photocard.id)
                    ? "✅ Possédé"
                    : "➕ Ajouter"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bouton "Load More" si pagination encore possible */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMorePhotocards}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-md shadow-md hover:bg-purple-700"
          >
            Charger plus
          </button>
        </div>
      )}
    </div>
  );
}
