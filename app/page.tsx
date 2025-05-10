import TablaCriaturas from "@/components/TablaCriaturas";
import TablaDrops from "@/components/TablaDrops";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {

  return (
    <main className="p-6 md:p-10 h-screen">
      <Tabs defaultValue="ciraturas" className="w-full h-full">
        <TabsList className="flex justify-center mb-6 gap-4">
          <TabsTrigger value="ciraturas" className="px-6 py-3 text-lg">Criaturas</TabsTrigger>
          <TabsTrigger value="drops" className="px-6 py-3 text-lg">Drops</TabsTrigger>
        </TabsList>
        <TabsContent value="ciraturas">
          <h1 className="text-2xl font-bold mb-4">Listado de Criaturas</h1>
          <TablaCriaturas />
        </TabsContent>
        <TabsContent value="drops">
          <h1 className="text-2xl font-bold mb-4">Listado de Drops</h1>
          <TablaDrops />
        </TabsContent>
      </Tabs>
    </main>
  );
}
