"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface CriaturaDrop {
  nombre: string;
  imagenUrl: string;
  porcentaje: string;
}

interface DropEntry {
  drop: string;
  imagenUrl: string; // imagen del drop
  criaturas: CriaturaDrop[];
}

interface DropRow {
  drop: string;
  imagenDrop: string;
  criatura: string;
  imagenCriatura: string;
  porcentaje: string;
}

export default function TablaDrops() {
  const [data, setData] = useState<DropRow[] | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    import("@/app/data/drops.json").then((mod) => {
      const raw = mod.default as DropEntry[];

      const flattened: DropRow[] = [];

      for (const entry of raw) {
        for (const criatura of entry.criaturas) {
          flattened.push({
            drop: entry.drop,
            imagenDrop: entry.imagenUrl,
            criatura: criatura.nombre,
            imagenCriatura: criatura.imagenUrl,
            porcentaje: criatura.porcentaje,
          });
        }
      }

      // Ordenar por drop (A-Z) y luego porcentaje (mayor a menor)
      flattened.sort((a, b) => {
        const cmp = a.drop.localeCompare(b.drop);
        if (cmp !== 0) return cmp;
        return parseFloat(b.porcentaje) - parseFloat(a.porcentaje);
      });

      setData(flattened);
    });
  }, []);

  const filteredData = useMemo(() => {
    if (!data) return [];

    const clean = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const words = clean(search).split(/\s+/).filter(Boolean);

    return data.filter((row) => {
      const drop = clean(row.drop);
      return words.every((word) => drop.includes(word));
    });
  }, [search, data]);

  const columns: ColumnDef<DropRow>[] = [
    {
      accessorKey: "drop",
      header: "Drop",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <img
            src={row.original.imagenDrop}
            alt={row.original.drop}
            className="w-6 h-6"
          />
          <span className="font-medium">{row.original.drop}</span>
        </div>
      ),
    },
    {
      accessorKey: "criatura",
      header: "Criatura",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <img
            src={row.original.imagenCriatura}
            alt={row.original.criatura}
            className="w-6 h-6"
          />
          <span>{row.original.criatura}</span>
        </div>
      ),
    },
    {
      accessorKey: "porcentaje",
      header: "%",
      cell: ({ row }) => <span>{row.original.porcentaje}%</span>,
    },
  ];

  return (
    <Card className="p-4">
      <div className="mb-4">
        <Input
          placeholder="Buscar drop..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      {data ? (
        <DataTable columns={columns} data={filteredData} />
      ) : (
        <Skeleton className="w-full h-64" />
      )}
    </Card>
  );
}
