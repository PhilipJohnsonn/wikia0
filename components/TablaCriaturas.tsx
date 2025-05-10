"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner"

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
    respawnMin: string;
    respawnMax: string;
    respawnMinSeg: number;
    respawnMaxSeg: number;
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
            return (
                <span>
                    {row.original.respawnMin} - {row.original.respawnMax}
                </span>
            );
        }
    },
    {
        accessorKey: "timer",
        header: "Timer",
        cell: ({ row }) => {
            const [seconds, setSeconds] = React.useState(0);
            const [running, setRunning] = React.useState(false);
            const [finished, setFinished] = React.useState(false);

            const respawnMin = row.original.respawnMinSeg;
            const respawnMax = row.original.respawnMaxSeg;

            const localKey = `timer_${row.original.nombre.replace(/\s+/g, "_")}`;

            // Restaurar desde localStorage
            useEffect(() => {
                const savedStart = localStorage.getItem(localKey);
                if (savedStart) {
                    const startTime = parseInt(savedStart);
                    const elapsed = Math.floor((Date.now() - startTime) / 1000);
                    const remaining = respawnMax - elapsed;

                    if (remaining > 0) {
                        setSeconds(remaining);
                        setRunning(true);
                        setFinished(false);
                    } else {
                        setSeconds(0);
                        setRunning(false);
                        setFinished(true);
                    }
                }
            }, []);

            useEffect(() => {
                if (!running || seconds <= 0) {
                    if (seconds <= 0 && running) {
                        setRunning(false);
                        setFinished(true);
                        localStorage.removeItem(localKey);
                        toast.success(`${row.original.nombre} ya respawneó`, {
                            duration: Infinity,
                            dismissible: true,
                            closeButton: true,
                        });

                    }
                    return;
                }

                const interval = setInterval(() => {
                    setSeconds((s) => s - 1);
                }, 1000);

                return () => clearInterval(interval);
            }, [running, seconds]);

            const start = () => {
                const now = Date.now();
                localStorage.setItem(localKey, now.toString());
                setSeconds(respawnMax);
                setRunning(true);
                setFinished(false);
            };

            const getColor = () => {
                if (seconds <= respawnMin) return "text-green-600 font-bold";
                return "text-foreground";
            };

            return (
                <div className="flex flex-wrap items-center gap-2">
                    {running ? (
                        <span className={`text-sm ${getColor()}`}>
                            {seconds > 0 ? `${seconds}s` : "Listo"}
                        </span>
                    ) : finished ? (
                        <>
                            <span className="text-sm text-green-600 font-bold">Listo</span>
                            <Button onClick={start} size="sm" variant="secondary">
                                Reiniciar
                            </Button>
                        </>
                    ) : (
                        <Button onClick={start} size="sm">Iniciar</Button>
                    )}
                </div>
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
    },
];

export default function TablaCriaturas() {
    const [data, setData] = useState<Criatura[] | null>(null);

    const [search, setSearch] = useState("");

    const filteredData = useMemo(() => {
        if (!data) return [];

        const clean = (str: string) =>
            str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const words = clean(search).split(/\s+/).filter(Boolean);

        return data.filter((criatura) => {
            const nombre = clean(criatura.nombre);
            return words.every((word) => nombre.includes(word));
        });
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
