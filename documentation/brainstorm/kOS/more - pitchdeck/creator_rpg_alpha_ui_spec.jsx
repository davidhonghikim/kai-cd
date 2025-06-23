// Alpha UI mockup for Creator RPG Web Sim
// Features avatar panel, ACT wallet, quest feed, and agent deck interface

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function CreatorRPGDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
      {/* Avatar Panel */}
      <Card className="md:col-span-1">
        <CardContent className="flex flex-col items-center">
          <img src="/avatar-placeholder.png" alt="Avatar" className="w-24 h-24 rounded-full mb-2" />
          <h2 className="text-xl font-bold">NovaEther</h2>
          <p className="text-sm text-muted">Tribe: Quantum Grove</p>
          <Progress value={38} className="w-full mt-4" />
          <p className="text-xs text-center mt-1">Level 2 - Curator</p>
        </CardContent>
      </Card>

      {/* ACT Wallet & Stats */}
      <Card className="md:col-span-1">
        <CardContent>
          <h3 className="font-semibold mb-2">Wallet</h3>
          <p>ACT Balance: <strong>12,473</strong></p>
          <p>REP: <strong>103</strong></p>
          <p>Agent Cards: <strong>6</strong></p>
          <Button className="mt-4 w-full">Stash Earnings</Button>
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
              {['Museia', 'EchoChord', 'Dripforge', 'Sentiel'].map((agent, index) => (
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
