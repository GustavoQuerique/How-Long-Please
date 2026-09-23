export default function TimeTable({ records, onEdit, onDelete, onAddOldRecord, onExport }) {
    return (
        <section>

            <div className="section-header">
                <p className="section-title">
                    Folha de Ponto Individual
                </p>
            </div>

            <div className="header-actions">

                <button
                    className="btn-secondary"
                    onClick={onExport}
                >
                    Exportar planilha
                </button>

                <button
                    className="btn-primary"
                    onClick={onAddOldRecord}
                >
                    Adicionar registro antigo
                </button>

            </div>

            <div className="table=container">
                <table>

                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Entrada</th>
                            <th>Saída</th>
                            <th>Total</th>
                            <th>Ações</th>
                        </tr>
                    </thead>

                    <tbody>

                        {records.map((record) => (
                            <tr key={record.id}>

                                <td>{record.date}</td>

                                <td>{record.clockIn}</td>

                                <td>{record.clockOut}</td>

                                <td>{record.total}</td>

                                <td>
                                    <div className="table-actions">

                                        <button
                                            className="btn-table"
                                            onClick={() => onEdit(record)}
                                        >
                                            Editar
                                        </button>

                                        <button
                                            className="btn-table btn-delete"
                                            onClick={() => onDelete(record.id)}
                                        >
                                            Excluir
                                        </button>

                                    </div>
                                </td>

                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>

        </section>
    )
}