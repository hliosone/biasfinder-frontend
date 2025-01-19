import { useState, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";

/** Types **/

// On ajoute un `id` pour le groupe, même si tu affiches/choisis encore par "name".
interface Group {
  id: number;       // <-- Ajouté
  name: string;     // ex: "ATEEZ"
}

// Artiste = { id: number; stageName: string; }
interface Artist {
  id: number;
  stageName: string;
}

// OfficialSource = { official_sources_id: number; title_version: string; }
interface OfficialSourceItem {
  official_sources_id: number;
  title_version: string;
}

type PCType = "PCA" | "POB" | "PCO" | "PCE";
const pcTypes: PCType[] = ["PCA", "POB", "PCO", "PCE"];

type SourceType = "ALBUM" | "EVENT" | "OTHER";
const sourceTypes: SourceType[] = ["ALBUM", "EVENT", "OTHER"];

/** Le composant principal **/
export default function ProposePhotocardPage() {
  // Mode : "pc" ou "source"
  const [mode, setMode] = useState<"pc" | "source">("pc");

  // GROUPES
  const [groups, setGroups] = useState<Group[]>([]);
  // L'utilisateur choisit le nom du groupe (pour l'afficher dans le <select>)
  const [selectedGroupName, setSelectedGroupName] = useState("");
  // On garde aussi l'ID du groupe, pour fetch par ID
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  // ARTISTES
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState<number | null>(null);

  // OFFICIAL SOURCES
  const [officialSources, setOfficialSources] = useState<OfficialSourceItem[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);

  // Feedback
  const [message, setMessage] = useState<string | null>(null);

  // Champs PC
  const [selectedPcType, setSelectedPcType] = useState<PCType>("PCA");
  const [pcName, setPcName] = useState("");
  const [shopName, setShopName] = useState("");
  const [url, setUrl] = useState("");

  // Champs Source
  const [selectedSourceType, setSelectedSourceType] = useState<SourceType>("ALBUM");
  const [title, setTitle] = useState("");
  const [versionName, setVersionName] = useState("");

  // 1) Charger la liste des groupes (nom + ID)
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const resp = await fetch("http://localhost:7070/api/groupslist");
        const data = await resp.json();
        // ex: data = [{ groups_id:1, groups_name:"ATEEZ" }, ...]
        const mapped = data.map((g: any) => ({
          id: g.groups_id,
          name: g.groups_name,
        }));
        setGroups(mapped);
      } catch (error) {
        console.error("Erreur fetch groups:", error);
      }
    };
    fetchGroups();
  }, []);

  // Quand l’utilisateur choisit un groupe dans le <select>,
  // on met à jour BOTH le groupName (pour l’affichage) ET le groupId
  const handleGroupChange = (newGroupName: string) => {
    setSelectedGroupName(newGroupName);

    // Retrouver l'ID correspondant
    const found = groups.find((g) => g.name === newGroupName);
    if (found) {
      setSelectedGroupId(found.id);
    } else {
      setSelectedGroupId(null);
    }
  };

  // 2) useEffect : quand selectedGroupName change, on fetch artists & sources
  useEffect(() => {
    if (!selectedGroupName || !selectedGroupId) {
      // Remettre à zéro
      setArtists([]);
      setSelectedArtistId(null);
      setOfficialSources([]);
      setSelectedSourceId(null);
      return;
    }

    // A) Charger la liste d'artistes via groupId
    const fetchArtists = async () => {
      try {
        // ex: GET /api/groups/{groupId}/artists
        const url = `http://localhost:7070/api/groups/${selectedGroupId}/artists`;
        const resp = await fetch(url);
        if (!resp.ok) {
          console.warn("Pas d'artistes pour ce groupe.");
          setArtists([]);
          setSelectedArtistId(null);
          return;
        }
        const data = await resp.json();
        // ex: data = [{ artists_id: 1, stage_name: "Hongjoong" }, ...]
        const mapped = data.map((a: any) => ({
          id: a.artists_id,
          stageName: a.stage_name,
        }));
        setArtists(mapped);
        setSelectedArtistId(null);
      } catch (err) {
        console.error("Erreur fetch artists:", err);
        setArtists([]);
        setSelectedArtistId(null);
      }
    };

    // B) Charger la liste d'off. sources via groupName (on garde ta logique existante)
    const fetchSources = async () => {
      try {
        const url = `http://localhost:7070/api/groups/official-sources?groupName=${encodeURIComponent(
          selectedGroupName
        )}`;
        const resp = await fetch(url);
        if (!resp.ok) {
          console.warn("Pas de source officielle pour ce groupe.");
          setOfficialSources([]);
          setSelectedSourceId(null);
          return;
        }
        const data = await resp.json();
        setOfficialSources(data);
        setSelectedSourceId(null);
      } catch (err) {
        console.error("Erreur fetch sources:", err);
        setOfficialSources([]);
        setSelectedSourceId(null);
      }
    };

    fetchArtists();
    fetchSources();
  }, [selectedGroupName, selectedGroupId]);

  // 3) handleSubmit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedGroupName) {
      setMessage("Veuillez choisir un groupe.");
      return;
    }

    if (mode === "pc") {
      // -----------
      if (!selectedArtistId) {
        setMessage("Veuillez choisir un artiste.");
        return;
      }
      if (!selectedSourceId) {
        setMessage("Veuillez choisir une source officielle.");
        return;
      }
      if (!pcName) {
        setMessage("Veuillez saisir un nom de photocard.");
        return;
      }

      const finalShopName =
        selectedPcType === "POB" && shopName.trim() ? shopName.trim() : "";

      // /api/photocards/proposecard/{pc_name}/{shop_name}/{url}/{pc_type}/{artists_id}/{official_sources_id}
// Si finalShopName est vide, on met "NULL" comme param
const shopParam = finalShopName || "NULL";

const endpoint =
  `http://localhost:7070/api/photocards/proposecard/` +
  `${encodeURIComponent(pcName)}/` +
  `${encodeURIComponent(shopParam)}/` +
  `${encodeURIComponent(url)}/` +
  `${encodeURIComponent(selectedPcType)}/` +
  `${selectedArtistId}/${selectedSourceId}`;

      try {
        const resp = await fetch(endpoint, { method: "POST" });
        const text = await resp.text();
        if (!resp.ok) {
          setMessage(`Erreur en proposant la photocard: ${text}`);
        } else {
          setMessage("Photocard proposée avec succès !");
          resetForm();
        }
      } catch (error) {
        console.error("Erreur fetch propose photocard:", error);
        setMessage("Erreur inconnue.");
      }
    } else {
      // ----------- Mode "nouvelle source" (inchangé)
      if (!title || !versionName) {
        setMessage("Veuillez remplir le titre et la version.");
        return;
      }

      const finalUrl =
        `http://localhost:7070/api/officialsource/propose?` +
        `groupName=${encodeURIComponent(selectedGroupName)}` +
        `&title=${encodeURIComponent(title)}` +
        `&type=${encodeURIComponent(selectedSourceType)}` +
        `&version_name=${encodeURIComponent(versionName)}`;

      try {
        const resp = await fetch(finalUrl, { method: "POST" });
        const text = await resp.text();
        if (!resp.ok) {
          setMessage(`Erreur en proposant la source: ${text}`);
        } else {
          setMessage("Source proposée avec succès !");
          resetForm();
        }
      } catch (err) {
        console.error("Erreur propose source:", err);
        setMessage("Erreur inconnue.");
      }
    }
  };

  // 4) resetForm
  const resetForm = () => {
    setMessage(null);
    setMode("pc");
    setSelectedGroupName("");
    setSelectedGroupId(null);
    setArtists([]);
    setSelectedArtistId(null);
    setOfficialSources([]);
    setSelectedSourceId(null);

    setSelectedPcType("PCA");
    setPcName("");
    setShopName("");
    setUrl("");

    setSelectedSourceType("ALBUM");
    setTitle("");
    setVersionName("");
  };

  return (
    <div className="p-8">
      <Link to="/" className="bg-purple-500 text-white px-4 py-2 rounded-md">
        ⬅ Retour
      </Link>

      <h1 className="text-2xl font-bold text-center my-4">
        Proposer une Photocard ou une Source
      </h1>

      {message && (
        <div className="bg-yellow-200 text-gray-800 p-2 mb-4 rounded-md">
          {message}
        </div>
      )}

      {/* Toggle PC / Source */}
      <div className="flex gap-4 justify-center mb-6">
        <label>
          <input
            type="radio"
            name="mode"
            value="pc"
            checked={mode === "pc"}
            onChange={() => setMode("pc")}
          />
          <span className="ml-1">Nouvelle Photocard</span>
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="source"
            checked={mode === "source"}
            onChange={() => setMode("source")}
          />
          <span className="ml-1">Nouvelle Source</span>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        {/* Choix du groupe */}
        <div>
          <label className="block font-bold">Groupe :</label>
          <select
            className="border p-2 rounded-md w-full"
            value={selectedGroupName}
            onChange={(e) => handleGroupChange(e.target.value)}
          >
            <option value="">-- Choisir un groupe --</option>
            {groups.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {mode === "pc" && (
          <>
            {/* Dropdown Artistes (avec selectedArtistId) */}
            <div>
              <label className="block font-bold">Artiste :</label>
              <select
                className="border p-2 rounded-md w-full"
                value={selectedArtistId ?? ""}
                onChange={(e) => setSelectedArtistId(Number(e.target.value))}
              >
                <option value="">-- Choisir un artiste --</option>
                {artists.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.stageName}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown Official Sources */}
            <div>
              <label className="block font-bold">Source officielle :</label>
              <select
                className="border p-2 rounded-md w-full"
                value={selectedSourceId ?? ""}
                onChange={(e) => setSelectedSourceId(Number(e.target.value))}
              >
                <option value="">-- Choisir une source --</option>
                {officialSources.map((s) => (
                  <option key={s.official_sources_id} value={s.official_sources_id}>
                    {s.title_version}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold">Type de PC :</label>
              <select
                className="border p-2 rounded-md w-full"
                value={selectedPcType}
                onChange={(e) => setSelectedPcType(e.target.value as PCType)}
              >
                {pcTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold">Nom de la Photocard :</label>
              <input
                className="border p-2 rounded-md w-full"
                type="text"
                value={pcName}
                onChange={(e) => setPcName(e.target.value)}
                placeholder="Ex: Season Songs"
              />
            </div>

            {selectedPcType === "POB" && (
              <div>
                <label className="block font-bold">Nom du Shop :</label>
                <input
                  className="border p-2 rounded-md w-full"
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Ex: Weverse, ktown4u..."
                />
              </div>
            )}

            <div>
              <label className="block font-bold">URL de l'image :</label>
              <input
                className="border p-2 rounded-md w-full"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </>
        )}

        {mode === "source" && (
          <>
            <div>
              <label className="block font-bold">Type de source :</label>
              <select
                className="border p-2 rounded-md w-full"
                value={selectedSourceType}
                onChange={(e) =>
                  setSelectedSourceType(e.target.value as SourceType)
                }
              >
                {sourceTypes.map((stype) => (
                  <option key={stype} value={stype}>
                    {stype}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold">Titre :</label>
              <input
                className="border p-2 rounded-md w-full"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: THE WORLD EP.2"
              />
            </div>

            <div>
              <label className="block font-bold">Version Name :</label>
              <input
                className="border p-2 rounded-md w-full"
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="Ex: Version A"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-md block mx-auto"
        >
          Proposer
        </button>
      </form>
    </div>
  );
}
