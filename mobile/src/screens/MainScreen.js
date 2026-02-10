
import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';

export default function MainScreen() {
  const [players, setPlayers] = useState('');
  const [result, setResult] = useState(null);

  const send = async () => {
    const list = players.split('\n').filter(Boolean);
    const res = await fetch('http://localhost:3001/api/sort-teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ players: list })
    });
    setResult(await res.json());
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold' }}>FuteDraft</Text>
      <TextInput
        multiline
        value={players}
        onChangeText={setPlayers}
        placeholder="Um jogador por linha"
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 10
        }}
      />
      <Button title="Sortear Times" onPress={send} />
      {result && <Text>{JSON.stringify(result, null, 2)}</Text>}
    </ScrollView>
  );
}
