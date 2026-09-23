import { useEffect, useState } from "react";

import writeExcelFile from "write-excel-file/browser";

import TimeTable from "../time_table/TimeTable";
import TimeInput from "./TimeInput";

export default function DashBoard() {
    const [name, setName] = useState(() => {
        return localStorage.getItem("userName") || " ";
    });

    const [showOldRecordForm, setShowOldRecordForm] = useState(false);

    const [oldDate, setOldDate] = useState("");
    const [oldClockIn, setOldClockIn] = useState("");
    const [oldClockOut, setOldClockOut] = useState("");

    const [oldRecordError, setOldRecordError] = useState("");


    const [clockIn, setClockIn] = useState("");
    const [clockOut, setClockOut] = useState("");
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);

    const [records, setRecords] = useState(() => {
        const savedRecords = localStorage.getItem("records");

        return savedRecords ? JSON.parse(savedRecords) : [];
    });

    useEffect(() => {
        localStorage.setItem(
            "records",
            JSON.stringify(records)
        );
    }, [records]);

    useEffect(() => {
        localStorage.setItem("userName", name);
    }, [name]);

    function calculateDurationInMinutes(clockIn, clockOut) {
        const [clockInHours, clockInMinutes] = clockIn.split(":").map(Number);
        const [clockOutHours, clockOutMinutes] = clockOut.split(":").map(Number);

        const totalClockInMinutes =
            clockInHours * 60 + clockInMinutes;

        const totalClockOutMinutes =
            clockOutHours * 60 + clockOutMinutes;

        const totalMinutes =
            totalClockOutMinutes - totalClockInMinutes;

        if (totalMinutes <= 0) {
            return null;
        }

        return totalMinutes;
    }

    function calculateTotal(clockIn, clockOut) {
        const totalMinutes = calculateDurationInMinutes(
            clockIn,
            clockOut
        );

        if (totalMinutes === null) {
            return null;
        }

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
    }

    function calculateTotalWorkedTime(records) {
        const totalMinutes = records.reduce(
            (sum, record) => {
                const recordMinutes =
                    calculateDurationInMinutes(
                        record.clockIn,
                        record.clockOut
                    );

                return sum + (recordMinutes ?? 0);
            },
            0
        );

        const hours =
            Math.floor(totalMinutes / 60);

        const minutes =
            totalMinutes % 60;

        return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
    }

    function handleSaveRecord() {
        if (!clockIn || !clockOut) {
            setError("Informe os horários de entrada e saída.");
            return;
        }

        const total = calculateTotal(clockIn, clockOut);

        if (total === null) {
            setError(
                "O horário de saída deve ser posterior ao horário de entrada."
            );
            return;
        }


        if (editingId !== null) {

            setRecords((previousRecords) =>
                previousRecords.map((record) =>
                    record.id === editingId
                        ? {
                            ...record,
                            clockIn,
                            clockOut,
                            total
                        }
                        : record
                )
            );

            return sortRecordsByDate(updatedRecords);

        } else {

            const newRecord = {
                id: Date.now(),
                date: new Date().toLocaleDateString("pt-BR"),
                clockIn,
                clockOut,
                total
            };

            setRecords((previousRecords) => {
                const updatedRecords = [
                    newRecord,
                    ...previousRecords
                ];

                return sortRecordsByDate(updatedRecords);
            });
        }


        setClockIn("");
        setClockOut("");
        setError("");
    }


    function handleEditRecord(record) {
        setClockIn(record.clockIn);
        setClockOut(record.clockOut);
        setEditingId(record.id);
        setError("");
    }

    function handleDeleteRecord(id) {
        setRecords((previousRecords) =>
            previousRecords.filter(
                (record) => record.id !== id
            )
        );

        if (editingId === id) {
            setEditingId(null);
            setClockIn("");
            setClockOut("");
        }
    }

    function handleCancelEdit() {
        setEditingId(null);
        setClockIn("");
        setClockOut("");
        setError("");
    }

    function handleOpenOldRecordForm() {
        setShowOldRecordForm(true);

        setOldDate("");
        setOldClockIn("");
        setOldClockOut("");
        setOldRecordError("");
    }

    function handleCloseOldRecordForm() {
        setShowOldRecordForm(false);

        setOldDate("");
        setOldClockIn("");
        setOldClockOut("");
        setOldRecordError("");
    }

    function formatDate(date) {
        const [year, month, day] = date.split("-");

        return `${day}/${month}/${year}`;
    }

    function parseDate(date) {
        const [day, month, year] = date.split("/");

        return new Date(year, month - 1, day);
    }

    function sortRecordsByDate(records) {
        return [...records].sort(
            (a, b) => parseDate(b.date) - parseDate(a.date)
        );
    }

    function handleSaveOldRecord() {
        if (!oldDate || !oldClockIn || !oldClockOut) {
            setOldRecordError(
                "Informe a data e os horários de entrada e saída."
            );

            return;
        }

        const total = calculateTotal(
            oldClockIn,
            oldClockOut
        );

        if (total === null) {
            setOldRecordError(
                "O horário de saída deve ser posterior ao horário de entrada."
            );

            return;
        }

        const newRecord = {
            id: Date.now(),
            date: formatDate(oldDate),
            clockIn: oldClockIn,
            clockOut: oldClockOut,
            total
        };

        setRecords((previousRecords) => {
            const updatedRecords = [
                newRecord,
                ...previousRecords
            ];

            return sortRecordsByDate(updatedRecords);
        });
    }

    function getTodayDate() {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    async function handleExportRecords() {
        if (records.length === 0) {
            setError("Não há registros para exportar.");
            return;
        }

        const spreadsheetData = [
            [
                { value: "Data", fontWeight: "bold" },
                { value: "Entrada", fontWeight: "bold" },
                { value: "Saída", fontWeight: "bold" },
                { value: "Total", fontWeight: "bold" }
            ],

            ...records.map((record) => [
                record.date,
                record.clockIn,
                record.clockOut,
                record.total
            ])
        ];

        const today = new Date()
            .toLocaleDateString("pt-BR")
            .replaceAll("/", "-");

        await writeExcelFile(
            spreadsheetData,
            {
                sheet: "Registros",
                columns: [
                    { width: 15 },
                    { width: 12 },
                    { width: 12 },
                    { width: 15 }
                ],
                stickyRowsCount: 1
            }
        ).toFile(
            `registros_ponto_${today}.xlsx`
        );

        setError("");
    }

    const totalWorkedTime = calculateTotalWorkedTime(records);



    return (
        <main className="container">
            <section className="dashboard-header">
                <div>
                    <h1 className="page-title">
                        Olá{" "}
                        <input className="name-input"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            maxLength={30}
                        />
                    </h1>
                    <p className="page-subtitle">Confira o seu horario atual</p>
                </div>
            </section>

            <section className="summary-grid">
                <TimeInput
                    label="HORÁRIO DE ENTRADA"
                    value={clockIn}
                    onChange={(event) => setClockIn(event.target.value)}
                    description="Horário de entrada"
                />
                <TimeInput
                    label="HORÁRIO DE SAIDA"
                    value={clockOut}
                    onChange={(event) => setClockOut(event.target.value)}
                    description="Horário de saida"
                />

                <div>
                    <button
                        className="btn-primary"
                        onClick={handleSaveRecord}
                    >
                        {editingId !== null
                            ? "Salvar alterações"
                            : "Registrar"}
                    </button>

                    {editingId !== null && (
                        <button
                            className="btn-secondary"
                            onClick={handleCancelEdit}
                        >
                            Cancelar
                        </button>
                    )}

                    <div className="stat-card">
                        <p className="stat-label" style={{ color: "#059669" }}>
                            Total de horas trabalhadas
                        </p>
                        <p className="stat-value">
                            {totalWorkedTime}
                        </p>

                    </div>
                </div>


            </section>


            {error && (
                <p className="form-error">
                    {error}
                </p>
            )}


            <TimeTable
                records={records}
                onEdit={handleEditRecord}
                onDelete={handleDeleteRecord}
                onAddOldRecord={handleOpenOldRecordForm}
                onExport={handleExportRecords}
            />


            {/* popUp para adicionar entradas antigas */}

            {showOldRecordForm && (
                <div className="modal-overlay">

                    <div className="card old-record-modal">

                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">
                                    Adicionar registro antigo
                                </h2>

                                <p className="stat-description">
                                    Informe a data e os horários do registro.
                                </p>
                            </div>

                            <button
                                className="btn-secondary"
                                onClick={handleCloseOldRecordForm}
                            >
                                Fechar
                            </button>
                        </div>


                        <div className="form-group">
                            <label className="form-label">
                                DATA
                            </label>

                            <input
                                type="date"
                                value={oldDate}
                                max={getTodayDate()}
                                onChange={(event) =>
                                    setOldDate(event.target.value)
                                }
                            />
                        </div>


                        <div className="summary-grid">

                            <TimeInput
                                label="HORÁRIO DE ENTRADA"
                                value={oldClockIn}
                                onChange={(event) =>
                                    setOldClockIn(event.target.value)
                                }
                                description="Horário de entrada"
                            />

                            <TimeInput
                                label="HORÁRIO DE SAÍDA"
                                value={oldClockOut}
                                onChange={(event) =>
                                    setOldClockOut(event.target.value)
                                }
                                description="Horário de saída"
                            />

                        </div>


                        {oldRecordError && (
                            <p className="form-error">
                                {oldRecordError}
                            </p>
                        )}


                        <div className="modal-actions">

                            <button
                                className="btn-secondary"
                                onClick={handleCloseOldRecordForm}
                            >
                                Cancelar
                            </button>

                            <button
                                className="btn-primary"
                                onClick={handleSaveOldRecord}
                            >
                                Adicionar registro
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </main>
    )
}