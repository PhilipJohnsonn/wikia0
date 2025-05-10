"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "./ui/input";

interface Drop {
    nombre: string;
    porcentaje: string;
    imagenUrl: string;
}

interface Criatura {
    nombre: string;
    hp: number;
    exp: number;
    oro: number;
    imageUrl: string;
    respawnMin: number;
    respawnMax: number;
    respawnUnidad: string;
    drops: Drop[];
}

const columns: ColumnDef<Criatura>[] = [
    {
        accessorKey: "nombre",
        header: "Nombre",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <img
                    src={row.original.imageUrl}
                    alt={row.original.nombre}
                    className="w-6 h-6 rounded"
                />
                <span>{row.original.nombre}</span>
            </div>
        )
    },
    {
        accessorKey: "hp",
        header: "HP"
    },
    {
        accessorKey: "exp",
        header: "EXP"
    },
    {
        accessorKey: "oro",
        header: "Oro"
    },
    {
        accessorKey: "respawn",
        header: "Respawn",
        cell: ({ row }) => {
            const { respawnMin, respawnMax, respawnUnidad } = row.original;
            return (
                <span>
                    {respawnMin}{respawnUnidad} – {respawnMax}{respawnUnidad}
                </span>
            );
        }
    },
    {
        accessorKey: "drops",
        header: "Drops",
        cell: ({ row }) => (
            <div className="flex flex-wrap gap-2">
                {row.original.drops.length === 0 && <span className="text-muted">—</span>}
                {row.original.drops.map((drop, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-1 border px-2 py-1 rounded bg-muted"
                    >
                        <img src={drop.imagenUrl} alt={drop.nombre} className="w-4 h-4" />
                        <span className="text-xs">
                            {drop.nombre} ({drop.porcentaje}%)
                        </span>
                    </div>
                ))}
            </div>
        )
    }
];

export default function TablaCriaturas() {
    const [data, setData] = useState<Criatura[] | null>(null);

    const [search, setSearch] = useState("");

    const filteredData = useMemo(() => {
        if (!data) return [];

        const clean = (str: string) =>
            str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        return data.filter((criatura) =>
            clean(criatura.nombre).includes(clean(search))
        );
    }, [search, data]);


    useEffect(() => {
        import("@/app/data/criaturas.json").then((mod) => {
            setData(mod.default);
        });
    }, []);

    return (
        <Card className="p-4">
            <div>
                <Input
                    placeholder="Buscar criatura por nombre..."
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
