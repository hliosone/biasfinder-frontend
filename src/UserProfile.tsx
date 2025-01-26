import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

type Photocard = {
  id: number;
  name: string;
  image: string;
};

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();

  // Deux states : l’un pour les cartes possédées, l’autre pour la wishlist
  const [owned, setOwned] = useState<Photocard[]>([]);
  const [wishlist, setWishlist] = useState<Photocard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Fetch des cartes possédées (have=true)
        const respOwned = await fetch(
          `/api/users/${userId}/collection`
        );
        const dataOwned = await respOwned.json();
        setOwned(
          dataOwned.map((pc: any) => ({
            id: pc.pc_id,
            name: pc.pc_name,
            image: pc.url,
          }))
        );

        // 2) Fetch de la wishlist (have=false)
        const respWishlist = await fetch(
          `/api/users/${userId}/wishlist`
        );
        const dataWishlist = await respWishlist.json();
        setWishlist(
          dataWishlist.map((pc: any) => ({
            id: pc.pc_id,
            name: pc.pc_name,
            image: pc.url,
          }))
        );
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-center text-purple-700 mb-4">
        Profil de l'utilisateur {userId}
      </h2>

      {/* Bouton de retour */}
      <Link to="/" className="bg-purple-500 text-white px-4 py-2 rounded-md">
        ⬅ Retour
      </Link>

      {/* Affichage conditionnel pendant le chargement */}
      {loading ? (
        <p className="mt-4">Chargement...</p>
      ) : (
        <div className="mt-8">
          {/* Section : Cartes possédées */}
          <h3 className="text-xl font-bold text-purple-700 mb-2">
            Cartes possédées
          </h3>
          {owned.length === 0 ? (
            <p>Aucune carte possédée</p>
          ) : (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {owned.map((pc) => (
                <div key={pc.id} className="border p-4">
                  <img
                    src={pc.image}
                    alt={pc.name}
                    className="w-full h-32 object-cover"
                  />
                  <p className="text-center font-bold">{pc.name}</p>
                </div>
              ))}
            </div>
          )}

          {/* Section : Wishlist */}
          <h3 className="text-xl font-bold text-purple-700 mb-2">Wishlist</h3>
          {wishlist.length === 0 ? (
            <p>Aucune carte en wishlist</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {wishlist.map((pc) => (
                <div key={pc.id} className="border p-4">
                  <img
                    src={pc.image}
                    alt={pc.name}
                    className="w-full h-32 object-cover"
                  />
                  <p className="text-center font-bold">{pc.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
