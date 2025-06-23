// Full Alpha UI for Creator RPG Web Sim
// Includes: avatar, wallet with API, quest feed, deck tabs, tribe/system selector

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const TRIBES = ["Quantum Grove", "Nebula Drift", "Iron Seed", "Verse Choir", "Delta Core"];
const SYSTEMS = ["Aetheris Prime", "Lunara V", "Polis Echo", "Mytherra", "Kairos"];

export default function CreatorRPGDashboard() {
  const [tribe, setTribe] = useState("Quantum Grove");
  const [system, setSystem] = useState("Aetheris Prime");
  const [wallet, setWallet] = useState({ act: 0, rep: 0, cards: 0 });
  const [loading, setLoading] = useState(false);
  const [stashMsg, setStashMsg] = useState("");

  // Fetch wallet + origin data on load
  useEffect(() => {
    fetch("/api/wallet").then(res => res.json()).then(setWallet);
    fetch("/api/origin").then(res => res.json()).then(data => {
      setTribe(data.tribe);
      setSystem(data.system);
    });
  }, []);

  const handleStash = async () => {
    setLoading(true);
    const res = await fetch("/api/wallet/stash", { method: "POST" });
    const data = await res.json();
    setStashMsg(`+${data.reward} ACT!`);
    setWallet(prev => ({ ...prev, act: data.newBalance }));
    setLoading(false);
  };

  const handleOriginChange = async (newTribe, newSystem) => {
    setTribe(newTribe);
    setSystem(newSystem);
    await fetch("/api/origin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tribe: newTribe, system: newSystem }),
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
      {/* Avatar Panel */}
      <Card className="md:col-span-1">
        <CardContent className="flex flex-col items-center">
          <img src="/avatar-placeholder.png" alt="Avatar" className="w-24 h-24 rounded-full mb-2" />
          <h2 className="text-xl font-bold">NovaEther</h2>
          <p className="text-sm text-muted">Tribe: {tribe}</p>
          <p className="text-sm text-muted">System: {system}</p>
          <Progress value={38} className="w-full mt-4" />
          <p className="text-xs text-center mt-1">Level 2 - Curator</p>
        </CardContent>
      </Card>

      {/* Tribe/System Selector */}
      <Card className="md:col-span-1">
        <CardContent>
          <h3 className="font-semibold mb-2">World Origin</h3>
          <p className="text-xs mb-1">Select your tribe:</p>
          <Select value={tribe} onValueChange={(v) => handleOriginChange(v, system)}>
            <SelectTrigger><SelectValue placeholder="Select Tribe" /></SelectTrigger>
            <SelectContent>
              {TRIBES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-xs mt-4 mb-1">Select star system:</p>
          <Select value={system} onValueChange={(v) => handleOriginChange(tribe, v)}>
            <SelectTrigger><SelectValue placeholder="Select System" /></SelectTrigger>
            <SelectContent>
              {SYSTEMS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* ACT Wallet & Stats */}
      <Card className="md:col-span-1">
        <CardContent>
          <h3 className="font-semibold mb-2">Wallet</h3>
          <p>ACT Balance: <strong>{wallet.act}</strong></p>
          <p>REP: <strong>{wallet.rep}</strong></p>
          <p>Agent Cards: <strong>{wallet.cards}</strong></p>
          <Button className="mt-4 w-full" onClick={handleStash} disabled={loading}>
            {loading ? "Stashing..." : "Stash Earnings"}
          </Button>
          {stashMsg && <p className="text-xs mt-2 text-green-500">{stashMsg}</p>}
        </CardContent>
      </Card>

      {/* Quest Feed */}
      <Card className="md:col-span-2">
        <CardContent>
          <h3 className="font-semibold mb-2">Active Quests</h3>
          <ul className="list-disc list-inside text-sm space-y-2">
            <li>✨ Remix 3 trending posts to earn 300 ACT</li>
            <li>🎨 Launch original content with 100+ upvotes</li>
            <li>📚 Collaborate on a curator tree for bonus REP</li>
          </ul>
          <Button className="mt-4">View Questboard</Button>
        </CardContent>
      </Card>

      {/* Agent Deck Tab */}
      <Card className="md:col-span-4">
        <Tabs defaultValue="agents">
          <TabsList>
            <TabsTrigger value="agents">Agent Deck</TabsTrigger>
            <TabsTrigger value="traits">Traits</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
              {["Museia", "EchoChord", "Dripforge", "Sentiel"].map((agent, index) => (
                <Card key={index} className="p-2">
                  <CardContent>
                    <p className="text-sm font-bold">{agent}</p>
                    <p className="text-xs text-muted">Type: Support</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
