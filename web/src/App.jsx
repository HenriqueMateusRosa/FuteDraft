import React, { useState, useRef } from "react";
import "./App.css";

export default function App() {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [isSorting, setIsSorting] = useState(false);
  const [warning, setWarning] = useState("");

  const MAX_PLAYERS = 18;
  const PER_TEAM = 9;

  const requiredPerTeam = {
    Goleiro: 1,
    Zagueiro: 1,
    Ala: 2,
    Meia: 2,
    Atacante: 2,
  };

  const nextId = useRef(1);

  const shuffle = (array) => {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const addPlayer = () => {
    if (!name.trim() || !position) {
      setWarning("Preencha nome e posição antes de adicionar.");
      return;
    }

    if (players.length >= MAX_PLAYERS) {
      setWarning(`Máximo de ${MAX_PLAYERS} jogadores atingido.`);
      return;
    }

    const newPlayer = {
      id: nextId.current++,
      name: name.trim(),
      position,
    };

    setPlayers((p) => [...p, newPlayer]);
    setName("");
    setPosition("");
    setWarning("");
  };

  const removePlayer = (id) => {
    setPlayers((p) => p.filter((player) => player.id !== id));
  };

  const computeDistribution = (list) => {
    const groups = {
      Goleiro: [],
      Zagueiro: [],
      Ala: [],
      Meia: [],
      Atacante: [],
    };

    list.forEach((p) => groups[p.position].push(p));
    Object.keys(groups).forEach(
      (g) => (groups[g] = shuffle(groups[g]))
    );

    const used = new Set();
    let finalA = [];
    let finalB = [];
    let notes = [];

    Object.keys(requiredPerTeam).forEach((pos) => {
      const needed = requiredPerTeam[pos] * 2;
      const group = groups[pos];

      if (group.length >= needed) {
        const selected = group.slice(0, needed);
        const aSel = selected.slice(0, requiredPerTeam[pos]);
        const bSel = selected.slice(requiredPerTeam[pos]);

        finalA.push(...aSel);
        finalB.push(...bSel);

        aSel.forEach((p) => used.add(p.id));
        bSel.forEach((p) => used.add(p.id));
      } else {
        group.forEach((p, i) => {
          if (i % 2 === 0) finalA.push(p);
          else finalB.push(p);

          used.add(p.id);
        });

        const missing = needed - group.length;
        if (missing > 0) {
          notes.push(
            `Faltaram ${missing} jogadores de ${pos} para completar as posições.`
          );
        }
      }
    });

    const remaining = shuffle(list.filter((p) => !used.has(p.id)));

    const extras = 1;
    for (let i = 0; i < extras; i++) {
      if (remaining.length) finalA.push(remaining.shift());
      if (remaining.length) finalB.push(remaining.shift());
    }

    let turn = 0;
    while ((finalA.length < PER_TEAM || finalB.length < PER_TEAM) && remaining.length) {
      const p = remaining.shift();
      if (finalA.length < PER_TEAM && finalB.length < PER_TEAM) {
        turn % 2 === 0 ? finalA.push(p) : finalB.push(p);
      } else if (finalA.length < PER_TEAM) {
        finalA.push(p);
      } else {
        finalB.push(p);
      }
      turn++;
    }

    if (finalA.length < PER_TEAM || finalB.length < PER_TEAM) {
      notes.push(`Times incompletos: A(${finalA.length}) B(${finalB.length}).`);
    }

    return { finalA, finalB, notes };
  };

  const sortTeams = () => {
    if (players.length === 0) {
      setWarning("Adicione jogadores antes do sorteio.");
      return;
    }

    setIsSorting(true);

    const interval = setInterval(() => {
      const temp = shuffle(players);
      const mid = Math.ceil(temp.length / 2);
      setTeamA(temp.slice(0, mid));
      setTeamB(temp.slice(mid));
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      const result = computeDistribution(players);
      setTeamA(result.finalA);
      setTeamB(result.finalB);
      setWarning(result.notes.join(" "));
      setIsSorting(false);
    }, 2000);
  };

  const resetAll = () => {
    setPlayers([]);
    setTeamA([]);
    setTeamB([]);
    setWarning("");
    nextId.current = 1;
  };

  return (
    <div className="page">
      <div className="card">
        <h1 className="title">FuteDraft</h1>

        <div className="info">
          <span>Jogadores: {players.length}/{MAX_PLAYERS}</span>
        </div>

        {warning && <div className="warning">{warning}</div>}

        <input
          className="input"
          placeholder="Nome do jogador"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="input"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        >
          <option value="">Selecione posição</option>
          <option value="Goleiro">Goleiro</option>
          <option value="Zagueiro">Zagueiro</option>
          <option value="Ala">Ala</option>
          <option value="Meia">Meia</option>
          <option value="Atacante">Atacante</option>
        </select>

        <button className="btn" onClick={addPlayer}>Adicionar Jogador</button>

        <h3 className="subtitle">Lista de Jogadores</h3>
        {players.map((p) => (
          <div key={p.id} className="playerItem">
            <span><b>{p.name}</b> — {p.position}</span>
            <button className="btnRemove" onClick={() => removePlayer(p.id)}>X</button>
          </div>
        ))}

        <div className="actions">
          <button className="btn sort" disabled={isSorting} onClick={sortTeams}>
            {isSorting ? "Sorteando..." : "Sortear Times"}
          </button>
          <button className="btn reset" onClick={resetAll}>Resetar Tudo</button>
        </div>

        <div className="teams">
          <div className="teamBox">
            <h3>Time A ({teamA.length})</h3>
            {teamA.map((p) => (
              <div key={p.id} className="teamPlayer">{p.name} — {p.position}</div>
            ))}
          </div>

          <div className="teamBox">
            <h3>Time B ({teamB.length})</h3>
            {teamB.map((p) => (
              <div key={p.id} className="teamPlayer">{p.name} — {p.position}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
