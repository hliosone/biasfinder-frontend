// AdminPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type ProposedCard = {
  id: number;
  name: string;
  image: string;
  // Ajoute d'autres champs si besoin (artist, group, etc.)
};

export default function AdminPage() {
  const [proposed, setProposed] = useState<ProposedCard[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger la liste des photocards “proposées”
  useEffect(() => {
    const fetchProposedCards = async () => {
      try {
        // ICI on utilise ta route : /api/proposedphotocards
        const response = await fetch("http://localhost:7070/api/proposedphotocards");
        // Si le back renvoie 404 quand c'est vide, on peut gérer le cas 
        if (!response.ok) {
          console.warn("Aucune carte proposée ou erreur");
          setProposed([]);
          return;
        }
        const data = await response.json();

        // Adapte si besoin, selon la structure renvoyée par le back
        const formatted = data.map((pc: any) => ({
          id: pc.pc_id,
          name: pc.pc_name,
          image: pc.url,
        }));

        setProposed(formatted);
      } catch (error) {
        console.error("Erreur lors de la récupération des cartes proposées :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProposedCards();
  }, []);

  // Fonction utilitaire pour cocher/décocher une carte
  const toggleSelectCard = (cardId: number) => {
    setSelectedIds((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  // Accepter les cartes sélectionnées
  const handleAccept = async () => {
    if (selectedIds.length === 0) return;

    try {
      await fetch("http://localhost:7070/api/admin/accept", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photocardIds: selectedIds }),
      });
      // On retire ces cartes acceptées de la liste proposed
      setProposed((prev) => prev.filter((pc) => !selectedIds.includes(pc.id)));
      // On vide la sélection
      setSelectedIds([]);
    } catch (error) {
      console.error("Erreur lors de l'acceptation :", error);
    }
  };

  // Refuser les cartes sélectionnées
  const handleReject = async () => {
    if (selectedIds.length === 0) return;

    try {
      await fetch("http://localhost:7070/api/admin/reject", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photocardIds: selectedIds }),
      });
      // On retire ces cartes refusées de la liste proposed
      setProposed((prev) => prev.filter((pc) => !selectedIds.includes(pc.id)));
      // On vide la sélection
      setSelectedIds([]);
    } catch (error) {
      console.error("Erreur lors du rejet :", error);
    }
  };

  return (
    <div className="p-8">
      {/* Bouton de retour à l'accueil */}
      <Link to="/" className="bg-purple-500 text-white px-4 py-2 rounded-md">
        ⬅ Retour à l'accueil
      </Link>
      <h1 className="text-2xl font-bold text-center text-red-500 my-4">
        Admin - Photocards proposées
      </h1>

      {/* Boutons d'action pour tout valider ou refuser en lot */}
      <div className="flex gap-4 justify-center mb-4">
        <button
          onClick={handleAccept}
          className="bg-green-600 text-white px-4 py-2 rounded-md"
        >
          Accepter sélection
        </button>
        <button
          onClick={handleReject}
          className="bg-red-600 text-white px-4 py-2 rounded-md"
        >
          Refuser sélection
        </button>
      </div>

      {loading ? (
        <p>Chargement des cartes proposées...</p>
      ) : proposed.length === 0 ? (
        <p>Aucune carte proposée.</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="py-2 px-4 text-left">Sélect.</th>
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Nom</th>
              <th className="py-2 px-4 text-left">Image</th>
            </tr>
          </thead>
          <tbody>
            {proposed.map((card) => (
              <tr key={card.id} className="border-b">
                {/* Colonne Checkbox */}
                <td className="py-2 px-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(card.id)}
                    onChange={() => toggleSelectCard(card.id)}
                  />
                </td>

                {/* Colonne ID */}
                <td className="py-2 px-4">{card.id}</td>

                {/* Colonne Nom */}
                <td className="py-2 px-4">{card.name}</td>

                {/* Colonne Image */}
                <td className="py-2 px-4">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-20 h-20 object-cover"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
