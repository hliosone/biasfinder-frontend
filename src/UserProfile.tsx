// UserProfile.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

type Photocard = {
  id: number;
  name: string;
  image: string;
};

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [owned, setOwned] = useState<Photocard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `http://localhost:7070/api/users/${userId}/collection`
        );
        const data = await response.json();
        setOwned(
          data.map((pc: any) => ({
            id: pc.pc_id,
            name: pc.pc_name,
            image: pc.url,
          }))
        );
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données utilisateur :",
          error
        );
      }
      setLoading(false);
    };

    fetchUserData();
  }, [userId]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-purple-700 mb-4">
        Profil de l'utilisateur {userId}
      </h2>
      <Link to="/" className="bg-purple-500 text-white px-4 py-2 rounded-md">
        ⬅ Retour
      </Link>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="grid grid-cols-3 gap-4 mt-4">
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
    </div>
  );
}
